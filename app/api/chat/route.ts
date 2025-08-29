import {NextRequest, NextResponse} from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import {getModels} from "@/lib/models";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const eventId = searchParams.get("eventId");

        const conn = await dbConnect();
        const {Chats} = getModels(conn);

        const chats = await Chats.find({eventId})
            .sort({createdAt: 1})
            .exec();
        return NextResponse.json(chats);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function PUT(req: NextRequest) {
    try{
    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const body = await req.json();
    const conn = await dbConnect();
    const {Chats, Events} = getModels(conn);

    const chat = await Chats.create({
        name,
        profilePic,
        message,
        eventId,
        createdAt: new Date(),
    });

    await Events.findByIdAndUpdate(eventId, {
        $push: {chats: chat._id}
    });

    return NextResponse.json(chat);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}