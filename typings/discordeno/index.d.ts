import { InteractionOptions } from "./Interaction"
import { DiscordInteractionDataOption } from "discordeno"

declare module "discordeno" {
  export interface DiscordInteractionData {
    options?: DiscordInteractionDataOption[] | InteractionOptions[]
  }
}