import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAFj5jrF26JDJdcteQzdojXcUypvm3UaKc",
  authDomain: "bhaag-df531.firebaseapp.com",
  databaseURL: "https://bhaag-df531-default-rtdb.firebaseio.com",
  projectId: "bhaag-df531",
  storageBucket: "bhaag-df531.firebasestorage.app",
  appId: "1:421542632463:web:xxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
