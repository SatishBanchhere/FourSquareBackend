import {NextRequest, NextResponse} from "next/server";
import {dbConnect} from '@/lib/dbConnect'
import {getModels} from '@/lib/models'
import {Connection} from "mongoose";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const fsq_place_id = searchParams.get("fsq_place_id");

        const url = process.env.PLACES_DETAILS!;
        const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY!;
        const apiVersion = process.env.API_VERSION!;
        const response = await fetch(`${url}/${fsq_place_id}`, {
            method: "GET",
            headers: {
                "X-Places-Api-Version": apiVersion,
                "accept": "application/json",
                "authorization": `Bearer ${FOURSQUARE_API_KEY}`,
            }
        });

        if (!response.ok) {
            console.error(response)
            return NextResponse.json({
                error: "Failed to fetch places"
            }, {
                status: response.status
            })
        }

        const fsqData = await response.json();
        console.log("FSQ Data: ", fsqData);
        const conn:Connection = await dbConnect();

        const {Places} = getModels(conn);

        const PlacesWithEvents = await Places.findOne({fsq_place_id})
            .populate({
                path: "events",
                model: "Events",
                populate: {
                    path: "chats",
                    model: "Chats"
                }
            })
            .exec();
        return NextResponse.json({fsqData, data: PlacesWithEvents}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            error: "Internal Server Error",
        }, {
            status: 500
        })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const fsq_place_id = searchParams.get("fsq_place_id");
        const body = await req.json();
        const { name, description, startDate, endDate} = body;
        const requiredFields = {fsq_place_id, name, description, startDate, endDate};

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return NextResponse.json({error: `${key} is required`}, {status: 400});
            }
        }

        const conn = await dbConnect();
        const {Events, Places} = getModels(conn);

        let place = await Places.findOne({fsq_place_id});
        if (!place) {
            place = new Places({
                fsq_place_id
            })
            await place.save();
        }

        const event = await Events.findOneAndUpdate({placeId: place._id}, {
            name,
            description,
            startDate,
            endDate,
            placeId: place._id,
        }, {
            new: true, upsert: true
        })
        await Places.findOneAndUpdate({fsq_place_id}, { $addToSet: {events: event._id} }, { new: true});
        return NextResponse.json({success: true, event}, {status: 200});
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({error: `Internal Server Error`}, {status: 500});
    }
}
