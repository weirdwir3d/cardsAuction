export async function fetchCard() {
    console.log('fuck u')
}

export async function fetchAuctionsAPI(selectedRarity, selectedType, maxPrice, searchQuery) {
    function updateQueryParams() {
        let queryParams = [];
        if (selectedRarity !== "All") {
            queryParams.push(`rarity=${selectedRarity.toLowerCase()}`);
        }
        if (selectedType !== "All") {
            queryParams.push(`type=${selectedType.toLowerCase()}`);
        }
        if (maxPrice) {
            queryParams.push(`price=lte:${maxPrice}`);
        }
        return queryParams.length > 0 ? "?" + queryParams.join("&") : "";
    }

    const queryString = updateQueryParams();
    let url = `http://localhost:3000/auctions${queryString}`;

    if (searchQuery) {
        let symbol = url.includes("type") || url.includes("rarity") || url.includes("price") ? "&" : "?";
        url += symbol + `search=${searchQuery}`;
    }

    console.log('Fetching auctions with URL:', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("No auctions found for the given filters.");
                return [];
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.auctions;
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw error;
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.cardsData || [];
    } catch (error) {
        console.error("Error retrieving cards:", error);
        throw error; // Re-throw error so calling function can handle it
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.foundCard;
    } catch (error) {
        console.error("Error retrieving card details:", error);
        throw error;
    }
}

export async function fetchBidsAPI(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`http://localhost:3000/bids?${queryString}`);

        if (response.ok) {
            const data = await response.json();
            return data.bids; // Return the entire data object
        } else if (response.status === 404) {
            return { bids: [] }; // Return an empty bids array in the expected format
        } else {
            console.error('Failed to retrieve bids:', response.statusText);
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
                'Authorization': `Bearer ${token}`, // You may want to pass the token as an argument
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("Error updating bid:", error);
        throw error; // Re-throw error so calling function can handle it
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
            throw new Error('Error fetching users');
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
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(updatedAuction),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const auctionData = await response.json();
        return auctionData.auction;
    } catch (error) {
        console.error("Error updating auction details:", error);
        throw error;
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

        const data = await response.json();

        if (!response.ok) {
            console.error(`Error updating card: ${data.message}`);
            throw new Error(data.message);
        }

        return data.card;
    } catch (error) {
        console.error("Error updating card details:", error.message);
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

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.status !== 201) {
            throw new Error(data.error || 'Failed to add card');
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
            throw new Error(errorData.error || 'HTTP error! Status: ' + response.status);
        }

        return await response.json();
    } catch (error) {
        console.error("Error trying to place a bid:", error);
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return cardId;
    } catch (error) {
        console.error("Error deleting card:", error);
        throw error;
    }
}

// api.js
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
        return { response, data }; // Return both response and data
    } catch (error) {
        throw new Error("An unexpected error occurred. Please try again later.");
    }
}

// api.js
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
            throw new Error(data.message || 'Registration failed');
        }

        return data; // Return the entire response data
    } catch (error) {
        console.error('Error during registration:', error);
        throw error; // Re-throw the error for handling in the component
    }
}
