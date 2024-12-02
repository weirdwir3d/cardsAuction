# Web Advanced Documentation

The goal of this report is to explain my design choices for the online auctions website for the Web Advanced class.

## Assignment description
The assignment consists in creating an auction website where users can make bids for products. *In short, people should be able to view items put up for aution on this site. only administrators can manage the items for auction. Meaning they can create update and delete them. If they would like to place a bid, users should register 
for an account and log in. Once logged in, they can place a bid.*

## Entities
My auction website is about rare Yu-Gi-Oh! cards. You can find a UML class diagram in this same folder. The diagram lays out the entities that exist within the program and since it's a pretty simple structure, it's easy to deduce the goal of the website by looking at the diagram alone. For my specific implementation of the auction website assignment, I made the design choice of creating two separate entities for auctions and for cards.  I made this design choice because I think it's neat if the process of auctioning can be broken down in two steps: first, filling in details about the object itself, and secondly, filling in details about the auction (base price, end date/time, etc.). So the admin can upload cards and their details, and then choose to auction them or not. They can edit the card or auction details independently. After an auction for a certain card is created, they can delete the auction without deleting the card linked to said auction (but of course if a card is deleted, the linked auction will be deleted as well). This design choice makes the project slightly more complex than the simplest correct implementation of the assignment, but it also makes it nicer.

## Styling
For styling, I used Tailwind. The palette might not be pretty or the contrast between some colors might not be high enough to pass WCAG AAA, but it does the job of not being horribly wrong. There is no dark mode.
SVG icons source: https://heroicons.com/.

# Pages

## App
- The "Forbidden" and "Unauthorized" page might be a bit redundant, but I would rather be redundant than imprecise, because these two errors have two different causes https://stackoverflow.com/questions/3297048/403-forbidden-vs-401-unauthorized-http-responses

## Auctions
Every time the page is visited, all cards are fetched. Of course, this is not ideal for a real-world application. Maybe it would be better to store the cards and/or auctions in a store, or in a DB, but I think this is not required for this assignment. The whole card is fetched (although we just need its image).

To learn more about the other pages, read the comments in the code.

- I didn't use the Context API because it's not reactive. I dispatched events intead and used component bindings.


## api.js
All API fetch calls to the backend are in this file.

# Backend
- I am aware it's not RESTful to have verbs in your endpoints, and therefore the endpoints _auth/register_ and _auth/login_ are not very RESTful, but I think verbs like register, login and logout are a common exception to it. Since both registering and logging in create a resource (one creates a new user and the other creates a new token), they both do POST calls and therefore, if it wasn't for the verb it would be harder to distinguish them. Sure, I could use something like _auth/token_ for logging in and something like _auth/registration_ for registering, but I feel like that makes it more confusing to read and to intuitively grasp what they mean. I also think the choice I made is the most common one among developers.
- Didn't sanitize input in the backend, only did it in the frontend, although in a real life scenario it's usually more important to do it in the backend

## Other notes
- I included the .env file in the submission. I know it should normally be kept private, but the requirements only mention to not include the node_modules, it doesn't say anything ebout .env files.
- To change environment without causing errors, edit the FRONTEND_PORT to the desired port number. 4173 is for production, 5173 is for development