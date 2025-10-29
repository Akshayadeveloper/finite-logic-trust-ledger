/**
 * FINITE LOGIC - TrustLedger: Event Sourcing Fabric (In-memory Simulation)
 * Stores and manages an immutable log of state-changing events.
 */

class EventStore {
    constructor() {
        this.eventStream = [];
        this.nextEventId = 1;
        console.log('[TrustLedger] Event Store Initialized.');
    }

    /**
     * Records a new state-changing event immutably.
     * @param {string} aggregateId The entity (e.g., 'User-101') that triggered the event.
     * @param {string} eventType The type of event (e.g., 'OrderPlaced', 'BalanceCredited').
     * @param {object} payload The data associated with the event.
     */
    recordEvent(aggregateId, eventType, payload) {
        const event = {
            eventId: this.nextEventId++,
            aggregateId: aggregateId,
            eventType: eventType,
            timestamp: Date.now(),
            payload: payload
        };
        this.eventStream.push(Object.freeze(event)); // Freeze for immutability
        return event;
    }

    /**
     * Reconstitutes the current state of an aggregate by replaying all its events.
     * This is the core principle of Event Sourcing.
     * @param {string} aggregateId The entity to rebuild.
     * @param {object} initialBaseState The starting point for the state (e.g., { balance: 0 }).
     * @returns {object} The current, calculated state.
     */
    rebuildState(aggregateId, initialBaseState) {
        const events = this.eventStream.filter(e => e.aggregateId === aggregateId);
        let state = JSON.parse(JSON.stringify(initialBaseState)); // Start with a fresh copy

        for (const event of events) {
            // State transition function: applies the event's payload to the current state
            switch (event.eventType) {
                case 'AccountCreated':
                    state.status = 'active';
                    state.balance = event.payload.initialBalance || 0;
                    break;
                case 'BalanceCredited':
                    state.balance += event.payload.amount;
                    break;
                case 'FundsWithdrawn':
                    state.balance -= event.payload.amount;
                    break;
                // Add more event handlers here...
            }
        }
        return state;
    }
}

// --- Demonstration ---
const eventStore = new EventStore();

// 1. Record events for a specific aggregate (User-101)
eventStore.recordEvent('User-101', 'AccountCreated', { initialBalance: 100 });
eventStore.recordEvent('User-101', 'BalanceCredited', { amount: 50 });
eventStore.recordEvent('User-101', 'FundsWithdrawn', { amount: 20 });
eventStore.recordEvent('User-102', 'AccountCreated', { initialBalance: 500 }); // Another user's events

// 2. Rebuild the current state of User-101
console.log('\n--- TrustLedger: Rebuilding State for User-101 ---');
const currentState = eventStore.rebuildState('User-101', { status: 'pending', balance: 0 });

console.log('Rebuilt Current State:', currentState); 
console.log(`Expected Balance: 100 + 50 - 20 = 130`);

module.exports = { EventStore };
      
