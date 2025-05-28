import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gameId = params.id
    console.log(`Deleting game with ID: ${gameId}`)

    return NextResponse.json({
      message: "Game deleted successfully",
      gameId,
    })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
