
//TODO: 
//1. anyone can create a giftcard on gifter.
//2. they will pass in the address of who the giftcard is for and the giftcard 
//coin can only be sent to that address.(use earmarked technology to enforce it)
//3. the giftcard can be traded on the marketplace
//4. giftcard can be multichain.
//giftcard can contain ownership of an nft or multiple objects where the owner can claim


module sui_giftcard_nft::giftcard_nft {
    use std::string::String;
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    use sui::coin::{Coin};
    use sui::sui::{SUI};
    use sui::transfer_policy::{Self, TransferRequest, TransferPolicy};
    use sui::package::{Self, Publisher};
    use sui::event;

    use gifter_contracts::giftcard_collections::{GIFTCARD};


    public struct GIFTCARD_NFT has drop {}


    //Event to be emitted when an item is listed in a kiosk.
    public struct ItemListed<phantom T> has copy, drop {
        kiosk: ID,
        id: ID,
        price:u64,

    }
    
    
   // initializing the package
   fun init (otw: GIFTCARD_NFT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        transfer::public_transfer(publisher, ctx.sender());
    }

    #[allow(lint(share_owned, self_transfer))]

    /// Create new kiosk
    public entry fun new_kiosk(ctx: &mut TxContext) {
        let (kiosk, kiosk_owner_cap) = kiosk::new(ctx);
        transfer::public_share_object(kiosk);
        transfer::public_transfer(kiosk_owner_cap, ctx.sender());
    }

     /// Place item inside Kiosk
    public fun place(kiosk: &mut Kiosk, cap: &KioskOwnerCap, item: GIFTCARD) {
        kiosk::place(kiosk, cap, item)
    }

     /// Withdraw from Kiosk
    public fun withdraw(kiosk: &mut Kiosk, cap: &KioskOwnerCap, item_id: object::ID): GIFTCARD {
        kiosk::take(kiosk, cap, item_id)

    }

    /// List item for sale
    public fun list(kiosk: &mut Kiosk, cap: &KioskOwnerCap, item_id: object::ID, price: u64) {
        kiosk::list<GIFTCARD>(kiosk, cap, item_id, price);
        
        event::emit(ItemListed<GIFTCARD>{
            kiosk: object::id(kiosk),
            id: item_id,
            price: price,
        });
    }

    /// Buy listed item
    public fun buy(kiosk: &mut Kiosk, item_id: object::ID, payment: Coin<SUI>): (GIFTCARD, TransferRequest<GIFTCARD>){
        kiosk::purchase(kiosk, item_id, payment)
    }

    /// Confirm the TransferRequest
    public fun confirm_request(policy: &TransferPolicy<GIFTCARD>, req: TransferRequest<GIFTCARD>) {
        transfer_policy::confirm_request(policy, req);
    }

      #[allow(lint(share_owned, self_transfer))]
    /// Create new policy for type `T`
    public fun new_policy(publisher: &Publisher, ctx: &mut TxContext) {
        let (policy, policy_cap) = transfer_policy::new<GIFTCARD>(publisher, ctx);
        transfer::public_share_object(policy);
        transfer::public_transfer(policy_cap, ctx.sender());
    }


}