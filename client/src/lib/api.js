export async function fetchAuctionsAPI(selectedRarity, selectedType, maxPrice, searchQuery) {
    let queryParams = [];
    if (selectedRarity !== "All") queryParams.push(`rarity=${selectedRarity.toLowerCase()}`);
    if (selectedType !== "All") queryParams.push(`type=${selectedType.toLowerCase()}`);
    if (maxPrice) queryParams.push(`price=lte:${maxPrice}`);

    //if there are queryParams, extend URL to filter results
    let url = `http://localhost:3000/auctions${queryParams.length > 0 ? "?" + queryParams.join("&") : ""}`;

    // add searchbar input, if any
    if (searchQuery) {
        url += `${url.includes("?") ? "&" : "?"}search=${searchQuery}`;
    }

    // console.log('fetching auctions with url:', url);

    try {
        const response = await fetch(url);

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchCardsAPI() {
    try {
        const response = await fetch("http://localhost:3000/cards", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // console.log('response:', response)

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchAuctionDetailsAPI(auctionId) {
    try {
        const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchCardDetailsAPI(cardId) {
    try {
        const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchBidsAPI(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`http://localhost:3000/bids?${queryString}`);

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function updateBidAPI(bidId, updateData) {
    try {
        const response = await fetch(`http://localhost:3000/bids/${bidId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function deleteBidAPI(bidId, token) {
    try {
        const response = await fetch(`http://localhost:3000/bids/${bidId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response;
        
    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchUsersAPI() {
    try {
        const response = await fetch(`http://localhost:3000/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function saveAuctionChangesAPI(auctionId, updatedAuction, token) {
    // console.log("updated auctionb frontend before sending:", updatedAuction)
    try {
        const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAuction)
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}


export async function saveCardChangesAPI(cardId, updatedCard, token) {
    try {
        const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedCard),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function addAuctionAPI({ cardId, basePrice, publishedDateTime, endDateTime, token }) {
    try {
        const response = await fetch("http://localhost:3000/auctions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                cardId,
                basePrice,
                publishedDateTime,
                endDateTime,
            }),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function addCardAPI({ name, description, type, rarity, imageUrl, auctionId, token }) {
    try {
        const response = await fetch("http://localhost:3000/cards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description,
                type,
                rarity,
                imageUrl,
                auctionId
            })
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function addBidAPI(newBid) {
    try {
        const response = await fetch(`http://localhost:3000/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(newBid),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function deleteAuctionAPI(auctionId, token) {
    try {
        const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function deleteCardAPI(cardId, token) {
    try {
        const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function loginAPI({ email, password }) {
    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function registerUserAPI({ username, email, password, confirmPassword }) {
    // console.log('request:', username, email, password, confirmPassword)
    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function logoutAPI() {
    // console.log('request:', username, email, password, confirmPassword)
    try {
        const response = await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response;

    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function fetchCard() {
    console.log('eheh')
}