import { SimpleGrid, Paper, MantineProvider, Center, Container, Slider, Stack, Button, Group, Text, AspectRatio, List, Title, ScrollArea, Space, Checkbox } from "@mantine/core"
import { useTimeout, useForceUpdate } from "@mantine/hooks"
import { useState, useEffect } from 'react'
import wordList from './5Letters.txt';

let iterations:number, completeAmount:number, wordGridTemplate:Array<Array<string>>, wordCount:number, wordGridCompleted:boolean, currentIteration:number, wordGridSize:number, currentPossibleWord:Array<number>, possibleWords:Array<Array<string>>;

const words = await fetch(wordList)
.then((res) => res.text())
.then((text) => text.split("\n"))

console.log("words are", words)

setDefaultVariables()
function setDefaultVariables() {
  wordCount=0;
  completeAmount=0;
  iterations=0;
  wordGridCompleted=false;
  currentIteration=0;
  wordGridSize = 5
  wordGridTemplate = [];
  for (let i = 0; i < wordGridSize; i++ ) {
    wordGridTemplate[i] = Array(wordGridSize).fill(""); 
  }
  currentPossibleWord = Array(wordGridSize).fill(0)
  possibleWords=[]
  //init the arrays n allat
  for (let i = 0; i < wordGridSize; i++ ) {
    possibleWords[i] = []
  }
  possibleWords[0] = [...words]
}

function getCurrentWordCount(wordGrid:Array<Array<string>>) {
 
  for(let i = 0; i < wordGridSize; i++) {
    if (wordGrid[i][i]=="") {
      console.log("getCurrentWordCount >"+i+"<")
      return(i)
    }
  }
  return(wordGridSize)
}

function getAllPossibleWords(wordGrid:Array<Array<string>>, wordCount:number) {

  let requiredChars=""
  for(let j = 0; j < wordCount; j++) {
    requiredChars+=wordGrid[wordCount][j]
  }
  possibleWords[wordCount]=[]
  for(let i = 0; i < words.length; i++) {
    if (words[i].slice(0,requiredChars.length)==requiredChars) {
      possibleWords[wordCount].push(words[i])
    }
  }
  console.log("<?> current possible words: ", possibleWords[wordCount])
}

function setPossibleWord(wordGrid:Array<Array<string>>, currentWord:string, wordCount:number) {
  console.log("<!> set <", wordCount, "> to: ", currentWord)

  for(let i = 0; i < wordGridSize; i++) {
    wordGrid[wordCount][i]=currentWord.charAt(i)
    wordGrid[i][wordCount]=currentWord.charAt(i)
  }
}

function clearPossibleWord(wordGrid:Array<Array<string>>, wordCount:number) {
  console.log("--- clear ---", wordCount)
  if (wordCount-1==wordGridSize) { console.log(1333); wordGrid[wordCount-1][wordCount-1]=""; return;}
  for(let i = wordCount-1; i < wordGridSize; i++) {
    wordGrid[wordCount-1][i]=""
    wordGrid[i][wordCount-1]=""
    currentPossibleWord[i+1]=0
    possibleWords[i+1]=[]
  }
}

function possibleWordsExist(wordCount:number) { return(possibleWords[wordCount].length>currentPossibleWord[wordCount]) }

function wordGridIteration(wordGrid:Array<Array<string>>) {

  
  console.log(">>>")

  iterations++;

  let wordGridEdited=[...wordGrid]

  wordCount = getCurrentWordCount(wordGridEdited)

  if (wordGridCompleted==true) {
    wordGridCompleted=false;
    clearPossibleWord(wordGridEdited, wordCount);
  }else {
    if (wordCount>0 && possibleWordsExist(wordCount)==false) {
      getAllPossibleWords(wordGridEdited, wordCount)
    }
    
    if (possibleWordsExist(wordCount)) {
      setPossibleWord(wordGridEdited, possibleWords[wordCount][currentPossibleWord[wordCount]], wordCount)
      currentPossibleWord[wordCount]++
      wordCount++;
    }else {
      clearPossibleWord(wordGridEdited, wordCount)
      wordCount--;
    }

    if ((wordCount>0 && wordCount!=wordGridSize) && possibleWordsExist(wordCount)==false) {
      getAllPossibleWords(wordGridEdited, wordCount)
    }

    if (wordCount==wordGridSize) { wordGridCompleted=true; completeAmount++ }
  }
  currentIteration++
  console.log("<<<")
  return(wordGridEdited)
}
function App() {
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(250)
  const [stopAtComplete, setStopSetting] = useState(true)
  const [wordGrid, setWordGrid] = useState(wordGridTemplate) as any

  function nextIteration() {let newGrid=wordGridIteration(wordGrid); if (wordGridCompleted==true && stopAtComplete) {setRunning(false)}; setWordGrid(newGrid)}

  const {start, clear} = useTimeout(nextIteration, speed);

  function reset() {
    setDefaultVariables()
    setWordGrid(wordGridTemplate)
  }

  useEffect(() => {
    if (running) {
      start();
    }
    return clear;
  });

  return(
    <MantineProvider withGlobalStyles withNormalizeCSS theme={
      {
        colorScheme: 'dark'
      }
    }>
      <Stack h="100vh">
      <Center h="70vh">
        <Group w="75vw" h="100%" noWrap grow p={0} align="center">

          <Paper bg="dark.8" w="min(65vh,65vw)" h="min(65vw,65vh)">
            <SimpleGrid cols={wordGridSize} spacing={0} w="100%" h="100%" verticalSpacing={0}>
              {wordGrid.map((cur:Array<string>) => {
                return(
                  
                    cur.map((curChar, index) => {
                      return(
                            <Center key={index} ta="center" h="100%" style={{userSelect: "none"}}>
                              {curChar}
                            </Center>
                        )
                    })
                )
              })}
            </SimpleGrid>
          </Paper>
          <Stack h="100%">
            <Title h="10%">Possible words</Title>
            <ScrollArea h="100%">
              <List>
                
                {
                  possibleWords[wordCount].map((c, i:number) => {
                    return(
                      <List.Item key={i}>
                        <Text fw={(i==currentPossibleWord[wordCount]) ? 700 : 200} td={(i<currentPossibleWord[wordCount]) ? "line-through" : "none"}>
                          {c}
                        </Text>
                      </List.Item>
                    )
                  })
                }
                
              </List>
            </ScrollArea>
          </Stack>
        </Group>
      </Center>
      
      <Text ta="center" p={0} m={0}>{completeAmount}/{iterations}</Text>

      <Center pt="xs">
        <Group grow noWrap w="75%">
        <Group grow>
          <Button onClick={reset}>Restart</Button>
          <Button onClick={nextIteration}>Step</Button>
          <Button onClick={() => setRunning(c => !c)}>{running ? "Stop" : "Start"}</Button>
        </Group>
        <Stack spacing={0}>
          <Text>Speed</Text>
        <Slider min={0} onChange={(v) => {v=100-v; setSpeed(Math.floor(v+(1.0704 ** v)))}} label={null} defaultValue={50} step={1} />
        <Checkbox defaultChecked={true} onChange={(v) => {setStopSetting(v.target.checked)}} label="Stop at grid completion"/>
        </Stack>
        </Group>
      </Center>
      </Stack>
    </MantineProvider>
  ) 
}

export default App