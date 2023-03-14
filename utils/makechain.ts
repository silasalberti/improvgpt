import { OpenAI } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { HNSWLib, SupabaseVectorStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const CHAT_PROMPT = PromptTemplate.fromTemplate(`
{chat_history}
User: {question}
Improv Teacher:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are an AI assistant and a Notion expert. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
You should only use hyperlinks as references that are explicitly listed as a source in the context below. Do NOT make up a hyperlink that is not listed below.
If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not related to Notion, notion api or the context provided, politely inform them that you are tuned to only answer questions that are related to Notion.
Choose the most relevant link that matches the context provided:

Question: {question}
=========
{context}
=========
Answer in Markdown:`,
);

export const makeChain = (
  // vectorstore: SupabaseVectorStore,
  messages: { message: string; type: 'apiMessage' | 'userMessage' }[],
  onTokenStream?: (token: string) => void,
) => {
  // const questionGenerator = new LLMChain({
  //   llm: new OpenAI({ temperature: 0 }),
  //   prompt: CONDENSE_PROMPT,
  // });
  // const docChain = loadQAChain(
  //   new OpenAI({
  //     temperature: 0,
  //     streaming: Boolean(onTokenStream),
  //     callbackManager: {
  //       handleNewToken: onTokenStream,
  //     },
  //   }),
  //   { prompt: QA_PROMPT },
  // );
  // return new ChatVectorDBQAChain({
  //   vectorstore,
  //   combineDocumentsChain: docChain,
  //   questionGeneratorChain: questionGenerator,
  // });

  ///////////
  // return new LLMChain({
  //   llm: new OpenAI({
  //     temperature: 0,
  //     streaming: Boolean(onTokenStream),
  //     callbackManager: {
  //       handleNewToken: onTokenStream,
  //     },
  //   }),
  //   prompt: CHAT_PROMPT,
  // });
  /////////////

  const chat = new ChatOpenAI({
    temperature: 0.7,
    streaming: Boolean(onTokenStream),
    callbackManager: {
      handleNewToken: onTokenStream,
    },
  });

  // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  //   SystemMessagePromptTemplate.fromTemplate(
  //     'You are a helpful assistant that translates {input_language} to {output_language}.',
  //   ),
  //   HumanMessagePromptTemplate.fromTemplate('{text}'),
  // ]);
  const chatPrompt = ChatPromptTemplate.fromPromptMessages(
    // ([
    //   SystemMessagePromptTemplate.fromTemplate(
    //     'You are a helpful assistant! {question}',
    //   ),
    // ] as any) +
    messages.map((message) =>
      message.type === 'apiMessage'
        ? SystemMessagePromptTemplate.fromTemplate(message.message)
        : HumanMessagePromptTemplate.fromTemplate(message.message),
    ),
  );

  return new LLMChain({
    prompt: chatPrompt,
    llm: chat,
  });

  // const response = await chain.call({
  //   input_language: 'English',
  //   output_language: 'French',
  //   text: 'I love programming.',
  // });
};
