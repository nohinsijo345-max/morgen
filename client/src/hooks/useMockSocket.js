// Mock Socket Hook - No Network Connections
// Use this when server is offline to prevent console errors

const useMockSocket = () => {
  // Return mock functions that do nothing but don't cause errors
  const mockFunction = () => {};
  
  return {
    socket: null,
    joinTicket: mockFunction,
    leaveTicket: mockFunction,
    joinFarmer: mockFunction,
    joinAdmin: mockFunction,
    onNewMessage: mockFunction,
    onTicketUpdated: mockFunction,
    offNewMessage: mockFunction,
    offTicketUpdated: mockFunction,
  };
};

export default useMockSocket;