// Random Fact Fetcher
// Save this as assets/js/fact-fetcher.js

class FactFetcher {
    constructor() {
        this.apiUrl = 'https://api.api-ninjas.com/v1/facts';
        this.factElement = null;
        this.buttonElement = null;
        this.isLoading = false;
    }

    init() {
        // Find elements
        this.factElement = document.getElementById('random-fact');
        this.buttonElement = document.getElementById('fact-button');

        if (!this.factElement || !this.buttonElement) {
            console.error('Fact fetcher elements not found');
            return;
        }

        // Add click event listener
        this.buttonElement.addEventListener('click', () => this.fetchFact());

        // // Load initial fact
        // this.fetchFact();
    }

    async fetchFact() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.updateButton('???');
        this.factElement.textContent = 'Wait...';

        try {
            const response = await fetch(this.apiUrl, {
                headers: {
                    'X-Api-Key': 'o4uq7cWneJp6ynIavJWGew==DM6SP8WMbkaAoSsI'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // The API returns an array, so we take the first fact
            const fact = Array.isArray(data) ? data[0]?.fact : data.fact;

            if (fact) {
                this.displayFact(fact);
            } else {
                throw new Error('No fact received');
            }

        } catch (error) {
            console.error('Error fetching fact:', error);
            this.displayError();
        } finally {
            this.isLoading = false;
            this.updateButton('Get Another Fact!');
        }
    }

    displayFact(fact) {
        this.factElement.innerHTML = `<em>"${fact}"</em>`;
    }

    displayError() {
        this.factElement.textContent = 'Oops! Could not fetch a fact right now. Try again later!';
    }

    updateButton(text) {
        if (this.buttonElement) {
            this.buttonElement.textContent = text;
            this.buttonElement.disabled = this.isLoading;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const factFetcher = new FactFetcher();
    factFetcher.init();
});