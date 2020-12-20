import React, { useRef } from 'react';

import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

require('dotenv').config();

firebase.initializeApp({
  // config
  apiKey: "AIzaSyASYKvn3tQe72OyEurGFPuXUfUWTDm_lJI",
  authDomain: "react-chat-7c45c.firebaseapp.com",
  projectId: "react-chat-7c45c",
  storageBucket: "react-chat-7c45c.appspot.com",
  messagingSenderId: "350629188301",
  appId: "1:350629188301:web:d38dbcf7abfd7cb1494f84",
  measurementId: "G-D5NJWSN57S",
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  
  return (
    <div className="App">
      <header className="App-header">
        {user? <SignOut />: <SignIn />}
      </header>
      <section>
        {user? <ChatRoom />: <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={SignInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const roller = useRef();
  const messageRef = firestore.collection('messages');
  const messageQuery = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(messageQuery, {idField: 'id'});
  const [chatInput, setChatInput] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await  messageRef.add({
      text: chatInput,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setChatInput('');
    roller.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
    <>
      <main>
        <div>{messages && messages.map(msg => <Message key={msg.id} messageObj={msg} />)}</div>
        <div ref={roller}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} />

        <button type="submit">Send</button>
      </form>
    </>
  )
}

function Message(props) {
  const { text, uid, photoURL } = props.messageObj;

  const messageStat = uid === auth.currentUser.uid? 'sent':'received';

  return (
    <div className={`message ${messageStat}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  )
}

export default App;
