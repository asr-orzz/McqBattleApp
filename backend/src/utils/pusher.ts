import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

const originalTrigger = pusher.trigger.bind(pusher);

pusher.trigger = (async (...args: Parameters<Pusher["trigger"]>) => {
  try {
    return await originalTrigger(...args);
  } catch (error) {
    console.error("Pusher event failed:", error instanceof Error ? error.message : error);
    return undefined as never;
  }
}) as Pusher["trigger"];

export default pusher;
