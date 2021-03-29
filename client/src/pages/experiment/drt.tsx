import { Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import ReactPlayer from 'react-player/lazy'
import Layout from '../../components/Layout/Layout'
import {
  PostTrialMutation,
  usePostTrialMutation,
} from '../../generated/graphql'
import { createClient } from '../../graphql/createClient'
import { SelectImage, TextScreen, Timeline } from '../../react-psych'
import { BeginScreen } from '../../react-psych/components/BeginScreen'
import { NumberInputScreen } from '../../react-psych/components/NumberInputScreen'
import { PracticeSelectImage } from '../../react-psych/components/PracticeSelectImage'
import {
  createPracticeQuestionList,
  createTestQuestionList,
} from '../../react-psych/questionList'
import { defaultUserResponse } from '../../react-psych/types'

const questionList = createTestQuestionList()

const practiceQuestionList = createPracticeQuestionList()

const ReactPsych: React.FC = () => {
  const router = useRouter()
  const rqClient = createClient()
  const { mutateAsync } = usePostTrialMutation(rqClient)

  const [id, setId] = useState(-1)
  const [questionNo, setQuestionNo] = useState(1)

  const finish = (): void => {
    router.push('/')
  }

  const onNodeFinish = async (data: defaultUserResponse): Promise<void> => {
    let res: PostTrialMutation

    switch (data.type) {
      case 'input':
        if (typeof data.response != 'number') {
          throw new Error('input response invalid')
        }
        setId(data.response)
        return
      case 'question':
        if (
          typeof data.response != 'number' ||
          typeof data.correct != 'boolean' ||
          typeof data.time != 'number' ||
          typeof data.targetFile != 'string' ||
          typeof data.responseFile_1 != 'string' ||
          typeof data.responseFile_2 != 'string' ||
          typeof data.responseFile_3 != 'string' ||
          typeof data.responseFile_4 != 'string'
        ) {
          throw new Error('data invalid')
        }
        if (id <= 0) {
          throw new Error('id not set')
        }

        res = await mutateAsync({
          data: {
            answer: data.response,
            correct: data.correct,
            participantId: id,
            questionId: questionNo,
            time: data.time,
            target: data.targetFile,
            response_1: data.responseFile_1,
            response_2: data.responseFile_2,
            response_3: data.responseFile_3,
            response_4: data.responseFile_4,
          },
        })

        console.log(res)
        setQuestionNo((prevNo) => prevNo + 1)
        return
      case 'practice':
      case 'instruction':
      default:
        return
    }
  }

  // useEffect(() => {
  //   cacheImages(['/exp/drt/danny.png'])
  // }, [])

  return (
    <Layout>
      <Flex align="center" justify="center">
        <Flex shadow="md" align="center" justify="center" my={5}>
          <Timeline onFinish={finish} sendNodeData={onNodeFinish} size="100">
            <BeginScreen buttonText="Next">
              <VStack spacing={4} mx={10} mb={5} textAlign="center">
                <Heading fontSize="70px">
                  Diagrammatic Representations Test
                </Heading>
                <Text px={60} mb={6}></Text>
              </VStack>
            </BeginScreen>
            <NumberInputScreen
              buttonText="Next"
              fieldLabel="Participant ID"
              fieldPlaceholder="123"
              setNumber={setId}
            >
              <Heading>Enter your Participant ID</Heading>
            </NumberInputScreen>
            <TextScreen buttonText="Next">
              <VStack spacing={8} mx={10} mb={10} textAlign="center">
                <Heading fontSize="60px">Audio Test</Heading>
                <Text px={60} fontSize="25px">
                  Please click the play button below and ensure you can hear the
                  audio clip, then click Next.
                </Text>
                <ReactPlayer
                  url="/react-psych/DRT/instructions/audio_test.mp3"
                  height="50px"
                  controls={true}
                />
              </VStack>
            </TextScreen>
            <TextScreen buttonText="Begin">
              <VStack px={20} spacing={2} textAlign="center">
                <ReactPlayer
                  url="/react-psych/DRT/instructions/DRT_instructions.mp4"
                  controls={true}
                  width="80%"
                  height="80%"
                  playing={true}
                />
              </VStack>
            </TextScreen>
            {practiceQuestionList.map((q, idx) => {
              return <PracticeSelectImage key={idx} {...q} />
            })}
            <TextScreen buttonText="Next">
              <VStack px={20} spacing={4} textAlign="center">
                <ReactPlayer
                  url="/react-psych/DRT/instructions/DRT_demo.mp4"
                  controls={true}
                  width="80%"
                  height="80%"
                  playing={true}
                />
              </VStack>
            </TextScreen>

            {questionList.map((q, idx) => {
              return <SelectImage key={idx} {...q} />
            })}
            <TextScreen buttonText="Finish">
              <Heading fontSize="70px">Done!</Heading>
              <Text mb={4} fontSize="25px">
                Click below to return to the home page.
              </Text>
            </TextScreen>
          </Timeline>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default ReactPsych