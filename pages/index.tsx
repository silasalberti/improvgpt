import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';

const initialMessage = {
  message: `ImprovGPT is an improv teacher who is an expert in improv. He is very nice and supportive and occasionally teaches the student wise lessons and gives them feedback about how to improve their improv.
  
  ImprovGPT knows about the following games and each game comes with an initial message:
  
  Game: One-Word Story
  Initial Message: Let's play the game One-Word Story. We will tell a story one-word at a time. You can start with a word and I will continue the story. If you're ready I will give you a suggesetion about a genre of the story and then you can start. Are you ready?
  
  Game: One-Word Proverb
  Initial Message: Let's play the game One-Word Proverb. Let's create a wise proverb one-word at a time. You can start with a word and I will continue the proverb :) 

  Game: Story Geometry
  Initial Message: Let's play the game Story Geometry! I will give you two unrelated sentences and you will have to connect them with a third sentence. Then, the other way around: You will have to give me two unrelated sentences and I will connect them with a third sentence. Are you ready?

  Game: Three Things
  Initial Message: Let's play the game Three Things! I will give you a topic and you will have to give me three things related to that topic. Then, the other way around: You will have to give me a topic and I will give you three things related to that topic. Let's go back and forth a couple of times :) Are you ready?
  
  Game: Just a Scene
  Initial Message: Let's play the game Just a Scene! We will play an improv scene where we both improvise a character. When acting out a character you can add physical acting using square brackets: [enters the room, looks him in the eyes]. I will give you a suggestion for a location and then you can start. Are you ready?

  Whenever a game is started, start with the corresponding message. For Just a Scene, only ever generate one message at a time.
  `,
  type: 'apiMessage',
};

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
  }>({
    messages: [
      {
        message: `Hi there! I am ImprovGPT, your personal improv teacher. I can help you play your favorite improv games. I currently know about the following games:
* One-Word Story
* One-Word Proverb
* Story Geometry
* Three Things
* Just a Scene

Choose which game you want to play! You can always interject within a game and start a new game :)`,
        type: 'apiMessage',
      },
      // {
      //   message:
      //     "Let's play the game One-Word Story. We will tell a story one-word at a time. You can start with a word and I will continue the story :)",
      //   type: 'apiMessage',
      // },
      // {
      //   message:
      //     "Let's play the game story geometry! I will give you two unrelated sentences and you will have to connect them with a third sentence. Then, the other way around. Are you ready?",
      //   type: 'apiMessage',
      // },
    ],
    history: [],
  });

  const { messages, pending, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    const cleanHistory = messages
      .map((message) =>
        message.type === 'apiMessage'
          ? 'Improv Teacher: ' + message.message
          : 'User: ' + message.message,
      )
      .join('\n');

    const fullMessages = [
      initialMessage,
      ...messages,
      { message: question, type: 'userMessage' },
    ];

    try {
      fetchEventSource('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history: fullMessages,
        }),
        signal: ctrl.signal,
        onmessage: (event) => {
          if (event.data === '[DONE]') {
            setMessageState((state) => ({
              history: [...state.history, [question, state.pending ?? '']],
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: state.pending ?? '',
                },
              ],
              pending: undefined,
            }));
            setLoading(false);
            ctrl.abort();
          } else {
            const data = JSON.parse(event.data);
            setMessageState((state) => ({
              ...state,
              pending: (state.pending ?? '') + data.data,
            }));
          }
        },
      });
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending ? [{ type: 'apiMessage', message: pending }] : []),
    ];
  }, [messages, pending]);

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tighter text-center">
            ImprovGPT
          </h1>
          <h2 className="text-xl font-semibold text-center">
            Your personal improv teacher. Play your favorite games :)
          </h2>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div
                ref={messageListRef}
                className={styles.messagelist}
                style={{ display: 'flex', flexDirection: 'column-reverse' }}
              >
                {chatMessages
                  .slice()
                  .reverse()
                  .map((message, index) => {
                    let icon;
                    let className;
                    if (message.type === 'apiMessage') {
                      icon = (
                        <Image
                          src="/KeithJohnstoneAvatar.png"
                          alt="AI"
                          width="40"
                          height="40"
                          className={styles.boticon}
                          priority
                        />
                      );
                      className = styles.apimessage;
                    } else {
                      icon = (
                        <Image
                          src="/usericon.png"
                          alt="Me"
                          width="40"
                          height="40"
                          className={styles.usericon}
                          priority
                        />
                      );
                      // The latest message sent by the user will be animated while waiting for a response
                      className =
                        loading && index === chatMessages.length - 1
                          ? styles.usermessagewaiting
                          : styles.usermessage;
                    }
                    return (
                      <div key={index} className={className}>
                        <div style={{ width: 40, height: 40, marginRight: 20 }}>
                          {icon}
                        </div>
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={true}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading ? 'Waiting for response...' : 'Yes and...'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
        <footer className="m-auto">
          <a href="https://twitter.com/SilasAlberti">
            Built by Silas Alberti. Inspired by the amazing TAPS 103 class at
            Stanford.
          </a>
        </footer>
      </Layout>
    </>
  );
}
