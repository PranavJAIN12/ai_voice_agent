import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        credits: v.number(),
        subscriptionId: v.optional(v.string())
    }),
    DiscussionRoom: defineTable({
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        conversation: v.optional(v.any()),
        summary: v.optional(v.any()),
        uid: v.optional(v.id('users')) //it will directly connect to users table
    }),
    ResumeBasedDiscussionRoom: defineTable({
        coachingOption: v.string(), 
        topic: v.string(),
        data: v.optional(v.any()),
        expertName: v.string(),
        conversation: v.optional(v.any()),
        summary: v.optional(v.any()),
        uid: v.optional(v.id('users')) //it will directly connect to users table
    }),




})