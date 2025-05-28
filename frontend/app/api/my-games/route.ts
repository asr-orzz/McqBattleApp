import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with your actual database logic
const mockGames = [
  {
    id: "1",
    name: "JavaScript Fundamentals Battle",
    createdBy: "CodeMaster",
    createdAt: "2024-01-15T10:30:00Z",
    participants: 12,
    status: "active" as const,
    questions: 20,
  },
  {
    id: "2",
    name: "React Hooks Challenge",
    createdBy: "ReactPro",
    createdAt: "2024-01-14T14:20:00Z",
    participants: 8,
    status: "completed" as const,
    questions: 15,
  },
  {
    id: "3",
    name: "TypeScript Advanced Quiz",
    createdBy: "TypeScriptGuru",
    createdAt: "2024-01-13T09:15:00Z",
    participants: 5,
    status: "draft" as const,
    questions: 25,
  },
  {
    id: "4",
    name: "Node.js Backend Battle",
    createdBy: "BackendNinja",
    createdAt: "2024-01-12T16:45:00Z",
    participants: 15,
    status: "active" as const,
    questions: 18,
  },
  {
    id: "5",
    name: "CSS Grid & Flexbox Showdown",
    createdBy: "CSSWizard",
    createdAt: "2024-01-11T11:30:00Z",
    participants: 22,
    status: "completed" as const,
    questions: 12,
  },
]

export async function GET(request: NextRequest) {
  try {
    // Return mock data directly without auth check
    return NextResponse.json({
      games: mockGames,
      total: mockGames.length,
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
