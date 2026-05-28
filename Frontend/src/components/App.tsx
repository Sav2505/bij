import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { setFirstState } from '../redux/slices/firstSlice';
import { IFirst, ILogin } from 'Shared/interfaces/general/interface';
import { getFirstSelector } from '../redux/selectors/firstSelector';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../localStorage/useLocalStorage';
import { fetchMessageAPI } from '../services/api';

export const App = () => {
  // Redux
  const dispatch = useDispatch();
  const firstList = useSelector(getFirstSelector);

  // Local Storage
  const { storedValue, setValue } = useLocalStorage('login_details', null);

  // Server
  const [message, setMessage] = useState<string>('');

  // Get date of now
  const currDate = useMemo(() => {
    return new Date().toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const loginDetails: ILogin = {
    id: 0,
    time: currDate,
    name: 'user1',
  };

  // Set Local storage login_details field
  useEffect(() => {
    if (!storedValue) {
      setValue(loginDetails);
    };
  }, [storedValue, setValue, loginDetails]);

  // Generate details for firstState set
  const generateRandomState = () => {
    const randomData: IFirst[] = [];
    const numOfItems = Math.floor((Math.random() * 10) + 1);

    for (let i = 0; i < numOfItems; i++) {
      randomData.push({
        field_1: Math.floor(Math.random() * 100),
        field_2: Math.random().toString(36).substring(7),
      });
    }

    return randomData;
  };

  // Update Redux - firstState
  const handleSetRandomState = () => {
    const randomState = generateRandomState();
    dispatch(setFirstState(randomState));
  };

  // Fetch message from the Server
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetchMessageAPI();
        setMessage(response);

      } catch (error) {
        console.error('Error fetching message: ', error);
      }
    };

    fetchMessage();
  }, []);

  return (
    <>
      <p>Hello World</p>
      <p>Local storage: {JSON.stringify(storedValue)}</p>
      <p>Server: {message}</p>
      <p>Redux: {firstList.map((obj) => "[" + obj.field_1 + ", " + obj.field_2 + "] ")}</p>
      <div>
        <button onClick={handleSetRandomState}>Set Random State</button>
      </div>
    </>
  );
};
