'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSpring, animated } from 'react-spring'

const questions = [
  "興味や関心をもって学んでいる。",
  "楽しみながら学んでいる。",
  "何のために学ぶのかをわかって学んでいる。",
  "学び方を工夫して学んでいる。",
  "一生懸命学んでいる。",
  "粘り強く学んでいる。",
  "やればできる、と思って学んでいる。",
  "他者と協力して学んでいる。",
  "他者と、わからないところは、教えたり教えられたりして学んでいる。",
  "将来の目標を意識して学んでいる。",
  "長期の学習計画を立て、それを調整しながら学んでいる。",
  "将来の目標はだいたい達成できると思って学んでいる。"
]

const categories = [
  { name: "感情的エンゲージメント", questions: [1, 2] },
  { name: "認知的エンゲージメント", questions: [3, 4] },
  { name: "行動的エンゲージメント", questions: [5, 6] },
  { name: "自己効力感", questions: [7] },
  { name: "社会的エンゲージメント", questions: [8, 9] },
  { name: "認知的エンゲージメント(将来)", questions: [10, 11] },
  { name: "自己効力感(将来)", questions: [12] }
]

const answerOptions = [
  { label: "当てはまる", value: 5 },
  { label: "まあ当てはまる", value: 4 },
  { label: "どちらともいえない", value: 3 },
  { label: "あまり当てはまらない", value: 2 },
  { label: "当てはまらない", value: 1 }
]

export default function Component() {
  const [name, setName] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(-1)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [showResults, setShowResults] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [fadeIn, setFadeIn] = useState(false)

  const fadeAnimation = useSpring({
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? 'translateY(0%)' : 'translateY(5%)',
    config: { tension: 300, friction: 20 }
  })

  useEffect(() => {
    setFadeIn(true)
  }, [currentQuestion])

  const handleStart = () => {
    if (name.trim()) {
      setCurrentQuestion(0)
    }
  }

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
    if (currentQuestion < questions.length - 1) {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setFadeIn(true)
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
        setFadeIn(true)
      }, 300)
    }
  }

  const handleSubmit = () => {
    const newResults = calculateResults()
    setAllResults([...allResults, { id: allResults.length + 1, results: newResults }])
    setShowResults(true)
  }

  const handleRetake = () => {
    setAnswers(Array(questions.length).fill(null))
    setCurrentQuestion(0)
    setShowResults(false)
  }

  const calculateResults = () => {
    return categories.map(category => {
      const categoryScores = category.questions.map(q => answers[q - 1])
      const average = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
      return {
        name: category.name,
        score: parseFloat(average.toFixed(2))
      }
    })
  }

  const ResultsDisplay = ({ currentResults, previousResults, allResults }) => {
    const [chartType, setChartType] = useState('bar')
    const currentResultsCurrent = currentResults.slice(0, 5)
    const currentResultsFuture = currentResults.slice(5)
    const previousResultsCurrent = previousResults ? previousResults.slice(0, 5) : null
    const previousResultsFuture = previousResults ? previousResults.slice(5) : null

    const ChartComponent = ({ currentData, previousData }) => {
      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart layout="vertical" data={currentData} margin={{ left: 200 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="name" type="category" width={200} tick={<CustomYAxisTick />} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="score" fill="#8884d8" name="現在のスコア" />
              {previousData && <Bar dataKey="previousScore" fill="#82ca9d" name="前回のスコア" />}
            </BarChart>
          </ResponsiveContainer>
        )
      } else {
        const combinedData = currentData.map((item, index) => ({
          ...item,
          previousScore: previousData ? previousData[index].score : 0
        }))
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={combinedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="現在のスコア" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              {previousData && <Radar name="前回のスコア" dataKey="previousScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )
      }
    }

    const CustomYAxisTick = (props) => {
      const { x, y, payload } = props;
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={-5} y={0} dy={5} textAnchor="end" fill="#666" fontSize={12}>
            {payload.value}
          </text>
        </g>
      );
    };

    const TimeSeriesChart = ({ data, isFuture }) => {
      const [activeIndex, setActiveIndex] = useState(null);
      const chartData = data.map(result => {
        const relevantResults = isFuture ? result.results.slice(5) : result.results.slice(0, 5)
        return {
          id: result.id,
          ...Object.fromEntries(relevantResults.map(r => [r.name, r.score]))
        }
      })

      const handleMouseEnter = (o, index) => {
        setActiveIndex(index);
      };

      const handleMouseLeave = () => {
        setActiveIndex(null);
      };

      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" label={{ value: '回数', position: 'insideBottomRight', offset: 0 }} />
            <YAxis domain={[0, 5]} label={{ value: 'スコア', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value, entry, index) => (
                <span style={{ color: entry.color, fontWeight: index === activeIndex ? 'bold' : 'normal' }}>
                  {value}
                </span>
              )}
            />
            {Object.keys(chartData[0]).filter(key => key !== 'id').map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                strokeWidth={index === activeIndex ? 3 : 1}
                activeDot={{ r: 8 }}
                onMouseEnter={(o) => handleMouseEnter(o, index)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    const combineResults = (current, previous) => {
      return current.map((item, index) => ({
        ...item,
        previousScore: previous ? previous[index].score : null
      }))
    }

    const combinedCurrentResults = combineResults(currentResultsCurrent, previousResultsCurrent)
    const combinedFutureResults = combineResults(currentResultsFuture, previousResultsFuture)

    return (
      <div className="space-y-4">
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setChartType('bar')} variant={chartType === 'bar' ? 'default' : 'outline'}>
            棒グラフ
          </Button>
          <Button onClick={() => setChartType('radar')} variant={chartType === 'radar' ? 'default' : 'outline'}>
            レーダーチャート
          </Button>
        </div>
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">現在</TabsTrigger>
            <TabsTrigger value="future">将来</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <ChartComponent currentData={combinedCurrentResults} previousData={previousResultsCurrent} />
                </div>
                <div className="w-full md:w-1/2">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2">カテゴリー</th>
                        <th className="border border-gray-300 p-2">現在のスコア</th>
                        {previousResultsCurrent && <th className="border border-gray-300 p-2">前回のスコア</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {combinedCurrentResults.map((result, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{result.name}</td>
                          <td className="border border-gray-300 p-2">{result.score}</td>
                          {previousResultsCurrent && <td className="border border-gray-300 p-2">{result.previousScore}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">時系列グラフ（現在）</h3>
                <TimeSeriesChart data={allResults} isFuture={false} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="future">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <ChartComponent currentData={combinedFutureResults} previousData={previousResultsFuture} />
                </div>
                <div className="w-full md:w-1/2">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2">カテゴリー</th>
                        <th className="border border-gray-300 p-2">現在のスコア</th>
                        {previousResultsFuture && <th className="border border-gray-300 p-2">前回のスコア</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {combinedFutureResults.map((result, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{result.name}</td>
                          <td className="border border-gray-300 p-2">{result.score}</td>
                          {previousResultsFuture && <td className="border border-gray-300 p-2">{result.previousScore}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">時系列グラフ（将来）</h3>
                <TimeSeriesChart data={allResults} isFuture={true} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (showResults) {
    const currentResults = allResults[allResults.length - 1].results
    const previousResults = allResults.length > 
 1 ? allResults[allResults.length - 2].results : null
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{name}さんの回答結果</h1>
        <ResultsDisplay currentResults={currentResults} previousResults={previousResults} allResults={allResults} />
        <div className="mt-4 flex justify-center">
          <Button onClick={handleRetake}>もう一度やる</Button>
        </div>
      </div>
    )
  }

  if (currentQuestion === -1) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>学習エンゲージメントサーベイ</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="お名前を入力してください"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleStart} disabled={!name.trim()}>開始</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>質問 {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <animated.div style={fadeAnimation}>
            <p className="mb-4">{questions[currentQuestion]}</p>
            <div className="flex flex-col gap-2">
              {answerOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  variant={answers[currentQuestion] === option.value ? "default" : "outline"}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </animated.div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleBack} disabled={currentQuestion === 0}>戻る</Button>
          {currentQuestion === questions.length - 1 && answers.every(a => a !== null) && (
            <Button onClick={handleSubmit}>提出する</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}