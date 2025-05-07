import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createNewRoom = mutation({
    args:{
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        // conversation: v.optional(v.any())
        uid: v.id('users')
    },
    handler:async(ctx,args)=>{
        
        const result = await ctx.db.insert('DiscussionRoom',{
            coachingOption: args.coachingOption,
            topic: args.topic,
            expertName: args.expertName,
            uid: args.uid
        })
        
      
        return result;
    }

    
})
export const GetDiscussionRoom = query({
    args:{
        id:v.id('DiscussionRoom')
    },
    handler:async(ctx,args)=>{
        const result = await ctx.db.get(args.id)
        return result
    }
})

export const updateConversation = mutation({
    args:{
        id:v.id('DiscussionRoom'),
        conversation:v.any()
    },
    handler:async(ctx,args)=>{
        await ctx.db.patch(args.id, {
            conversation: args.conversation
        })
    }
})

export const updateSummary = mutation({
    args:{
        id:v.id('DiscussionRoom'),
        summary:v.any()
    },
    handler:async(ctx,args)=>{
        await ctx.db.patch(args.id, {
            summary: args.summary
        })
    }
})


export const GetAllDiscussionRoom = query({
    args:{
        uid:v.id('users')
    },
    handler:async(ctx,args)=>{
        const result = await ctx.db.query('DiscussionRoom').filter(q=>q.eq(q.field('uid'),args.uid)).collect();
        return result
    }
})