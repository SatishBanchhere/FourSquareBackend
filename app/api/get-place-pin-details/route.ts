import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {

    try {
        const searchParams = req.nextUrl.searchParams;
        const fsq_place_id = searchParams.get("fsq_place_id");

        if (!fsq_place_id) {
            return NextResponse.json({error: "Invalid query parameters",}, {status: 400})
        }

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

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}