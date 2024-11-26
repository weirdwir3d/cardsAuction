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
        if (!response.ok) {
            throw new Error(`Http error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.auctions || [];
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw new Error("Network error while trying to fetch auctions. Please try again later");
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

        if (!response.ok) {
            throw new Error(`Http error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.cardsData || [];
    } catch (error) {
        console.error("Error retrieving cards:", error);
        throw new Error("Network error while trying to fetch cards. please try again later");
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

        if (!response.ok) {
            throw new Error(`Http error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error retrieving auction details:", error);
        throw error;
    }
}

export async function fetchCardAPI(cardId) {
    try {
        const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`Http error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.foundCard;
    } catch (error) {
        console.error("Error retrieving card details:", error);
        throw error;
    }
}

// TODO: looks sus, might have to edit
export async function fetchBidsAPI(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`http://localhost:3000/bids?${queryString}`);

        if (response.ok) {
            const data = await response.json();
            return data.bids;
        } else if (response.status === 404) {
            return { bids: [] };
        } else {
            console.error('Could not retrieve bids:', response.statusText);
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error('Error fetching bids:', error);
        throw error;
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

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("error updating bid:", error);
        throw error;
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

        if (!response.ok) {
            throw new Error('Failed to delete bid');
        }

        return bidId;
    } catch (error) {
        console.error('Error deleting bid:', error);
        throw error;
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Error fetching users :c');
        }

        return data.usersData;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function saveAuctionChangesAPI(auctionId, updatedAuction, token) {
    try {
        const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAuction)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
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

        // console.log('sending:', JSON.stringify(updatedCard))

        const data = await response.json();

        if (!response.ok) {
            console.error(`Error updating card : ${data.message}`);
            throw new Error(data.message);
        }

        return data.card;
    } catch (error) {
        console.error("Error updating card details:", error.message);
        throw error;
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

        // console.log('response status:', response.status);
        const data = await response.json();
        // console.log('response data:', data);

        if (response.status !== 201) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("Error adding auction:", error);
        throw error;
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

        // console.log('response status:', response.status);
        const data = await response.json();
        // console.log('response data:', data);

        if (response.status !== 201) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("Error adding card:", error);
        throw error;
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error trying to bid:", error);
        throw error;
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

        if (!response.ok) {
            throw new Error('Failed to delete auction');
        }

        return auctionId;
    } catch (error) {
        console.error('Error deleting auction:', error);
        throw error;
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

        if (!response.ok) {
            throw new Error(`http error! Status: ${response.status}`);
        }
        return cardId;
    } catch (error) {
        console.error("Error deleting card:", error);
        throw error;
    }
}

export async function loginAPI(email, password) {
    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('data:', data)
        return data;
    } catch (error) {
        throw new Error("Unexpected error occurred, please try again later");
    }
}

export async function registerUserAPI({ username, email, password, confirmPassword }) {
    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error('error while registering:', error);
        throw error;
    }
}

export async function fetchCard() {
    console.log('eheh')
}