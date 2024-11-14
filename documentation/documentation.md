# Web Advanced Documentation

The goal of this report is to explain my design choices for the online auctions website for the Web Advanced class.

## Assignment description
The assignment consists in creating an auction website where users can make bids for products. *In short, people should be able to view items put up for aution on this site. only administrators can manage the items for auction. Meaning they can create update and delete them. If they would like to place a bid, users should register 
for an account and log in. Once logged in, they can place a bid.*

## Design choices
My auction website is about rare Yu-Gi-Oh! cards. You can find a UML class diagram in this same folder. The diagram lays out the entities that exist within the program and since it's a pretty simple structure, it's easy to deduce the goal of the website by looking at the diagram alone. For my specific implementation of the auction website assignment, I made the design choice of creating two separate entities for auctions and for cards.  I made this design choice because I think it's neat if the process of auctioning can be broken down in two steps: first, filling in details about the object itself, and secondly, filling in details about the auction (base price, end date/time, etc.). So the admin can upload cards and their details, and then choose to auction them or not. They can edit the card or auction details independently. After an auction for a certain card is created, they can delete the auction without deleting the card linked to said auction (but of course if a card is deleted, the linked auction will be deleted as well). This design choice makes the project slightly more complex than the simplest correct implementation of the assignment, but it also makes it nicer.

## Styling
For styling, I used Tailwind. For the color palette of the website, I tried to stick to the color palette of the second version of the Duel Disk, a piece of dueling equipment within the Yu-Gi-Oh! franchise https://yugipedia.com/wiki/Duel_Disk. It might not be pretty or the contrast between some colors might not be high enough to pass WCAG AAA, but it does the job of not being horribly wrong. There is no dark mode.
SVG icons source: https://heroicons.com/.

# Pages

## App
- The "Forbidden" and "Unauthorized" page might be a bit redundant, but I would rather be redundant than imprecise, because these two errors have two different causes https://stackoverflow.com/questions/3297048/403-forbidden-vs-401-unauthorized-http-responses

## Auctions