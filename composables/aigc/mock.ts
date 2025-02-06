const MOCK_RESPONSES = [
  '今天天气真不错,我们一起去公园散步吧。路上可以看看花草树木,呼吸新鲜空气,感受大自然的美好。这样的休闲时光最让人放松了。',
  '学习是一个永无止境的过程,我们要保持谦虚好学的态度。每天进步一点点,积累的知识终会让我们受益匪浅。坚持就是胜利。',
  '生活中处处都有美好,关键是要用心去发现。阳光、微风、花香、鸟鸣,这些都是大自然赐予我们的礼物。让我们怀着感恩的心继续前行。',
  '朋友之间要互相理解、互相支持。在对方遇到困难时伸出援手,分享快乐时真诚祝福。这样的友情才能天长地久。',
  '工作要讲究方法,提高效率。合理安排时间,专注于重要的事情。劳逸结合才能保持良好的状态,创造更大的价值。',
]

export async function getMockResponse(callback: (sentence: string) => void) {
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length)

  // 开始模拟对话 只要没取完就继续取
  let sentence = MOCK_RESPONSES[randomIndex]

  while (sentence) {
    await sleep(1000)

    const randomLen = Math.min(sentence.length, Math.floor(Math.random() * 10) + 1)

    const chunk = sentence.slice(0, randomLen)

    callback(chunk)

    sentence = sentence.slice(randomLen)

    await sleep(Math.floor(Math.random() * 500) + 100)
  }

  return sentence
}
