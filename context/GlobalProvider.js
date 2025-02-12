import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/appwrite';

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState(null); // Store the email of the signed-in user

  useEffect(() => {
    // Fetch current user when the app initializes
    const fetchCurrentUser = async () => {
      try {
        if (email) {
          const currentUser = await getCurrentUser(email); // Pass the email parameter
          if (currentUser) {
            setIsLoggedIn(true);
            setUser(currentUser);
          } else {
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [email]); // Run when email changes

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        setEmail, // Provide setEmail to update the email after sign-in
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;