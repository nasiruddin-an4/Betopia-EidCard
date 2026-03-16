import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "betopia_group";
const COLLECTION_NAME = "activity_logs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

  // Authentication barrier
  if (!password || password !== process.env.STATS_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get aggregate sums or counts of views, downloads
    const views = await collection.countDocuments({ action: "view" });
    const downloads = await collection.countDocuments({ action: "download" });
    
    // Get last 100 activities ordered by timestamp desc
    const actions = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      views,
      downloads,
      actions: actions.map(item => ({
        id: item._id,
        action: item.action,
        name: item.name,
        designation: item.designation,
        timestamp: item.timestamp
      }))
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ error: "Failed to read database logs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action, name, designation } = await request.json();

    if (!["view", "download"].includes(action)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const logEntry = {
      action,
      timestamp: new Date().toISOString(),
    };

    if (action === "download") {
      if (name) logEntry.name = name;
      if (designation) logEntry.designation = designation;
    }

    await collection.insertOne(logEntry);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database write error:", error);
    return NextResponse.json({ error: "Failed to update logs" }, { status: 500 });
  }
}
