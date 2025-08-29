import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");


        if (!lat || !lng) {
            return NextResponse.json({error: "Invalid query parameters",}, {status: 400})
        }

        const url = process.env.PLACES_SEARCH_ROUTE!;
        const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY!;
        const apiVersion = process.env.API_VERSION!;

        const ll = `${lat},${lng}`;

        const response = await fetch(`${url}?ll=${ll}`, {
            method: "GET",
            headers: {
                "X-Places-Api-Version": apiVersion,
                "accept": "application/json",
                "authorization": `Bearer ${FOURSQUARE_API_KEY}`,
            }
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        console.log(data.results.length);
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}