import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAFj5jrF26JDJdcteQzdojXcUypvm3UaKc",
  authDomain: "bhaag-df531.firebaseapp.com",
  databaseURL: "https://bhaag-df531-default-rtdb.firebaseio.com",
  projectId: "bhaag-df531",
  storageBucket: "bhaag-df531.firebasestorage.app",
  appId: "1:421542632463:web:xxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, query, orderByChild, limitToLast, equalTo };
export default app;
