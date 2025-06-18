import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const GetResumeBasedDiscussionRoom = query({
    args:{
        id:v.id('ResumeBasedDiscussionRoom')
    },
    handler:async(ctx,args)=>{
        const result = await ctx.db.get(args.id)
        return result
    }
})

export const createNewRoom = mutation({
  args: {
    coachingOption: v.string(),
    topic: v.string(),
    expertName: v.string(),
    data: v.optional(v.any()),
    uid: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("ResumeBasedDiscussionRoom", {
      coachingOption: args.coachingOption,
      topic: args.topic,
      data: args.data ?? {}, // ✅ fallback in mutation too
      expertName: args.expertName,
      conversation: [],
      summary: "",
      uid: args.uid,
    });
    return id;
  },
});
export const updateConversation = mutation({
    args:{
        id:v.id('ResumeBasedDiscussionRoom'),
        conversation:v.any()
    },
    handler:async(ctx,args)=>{
        await ctx.db.patch(args.id, {
            conversation: args.conversation
        })
    }
})