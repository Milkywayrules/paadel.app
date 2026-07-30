# Match + invite link as MVP1 core domain model

MVP1 centers on three entities: Player, Match, and Invite. Invites use a shareable tokenized link as the primary shippable path; in-app invites to known users follow the same Invite record.

Link-based invites minimize cold-start friction (invitee may not be a user yet) and mirror proven patterns from Padel Mixer and Ace. Stats-only manual entry and court-booking-first flows were rejected as MVP1 because they weakly differentiate and depend on club supply.
