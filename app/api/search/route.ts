import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, radius } = body;


        const url = process.env.PLACES_SEARCH_ROUTE!;
        const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY!;
        const apiVersion = process.env.API_VERSION!;
        const response = await fetch(`${url}?query=${query}&radius=${radius}`, {
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

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({
            error: "Internal Server Error",
        }, {
            status: 500
        })
    }
}