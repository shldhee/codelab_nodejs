const debug = require('../../utils/debug')('post')

let posts = [{
        title: 'post 3',
        body: 'this is post 3'
    },
    {
        title: 'post 2',
        body: 'this is post 2'
    },
    {
        title: 'post 1',
        body: 'this is post 1'
    }, {
        title: 'post 4',
        body: 'this is post 3'
    },
    {
        title: 'post 5',
        body: 'this is post 2'
    },
    {
        title: 'post 6',
        body: 'this is post 1'
    },
]

// const index = () => (req, res, next) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.end(JSON.stringify(posts))
// }

// const index = () => (req, res, next) => {
//     res.status(200).json(posts);
//   }

const index = () => (req, res, next) => {
    const limit = req.query.limit * 1 || 2 // 포스트 갯수
    const page = req.query.page * 1 || 1 // 페이지 요청 수

    const begin = (page - 1) * limit // page가 1이면 slice가 0부터 시작한다. 만약 2이면 * limit이 포스트 개수 계산되므로 거기서부터 데이터 받게 한다.
    const end = begin + limit // 시작이 정해지면 거기다가 최대 포스트 갯수만 더하면 불러올 데이터 끝

    res.json(posts.slice(begin, end))
}

const create = () => (req, res, next) => {
    debug(`create() ${req.body.title}`)
    const {title, body} = req.body
    const post = {title, body}
  
    if (!post.title || !post.body) {
      return res.status(400).send('parameter error')
    }
    console.log(post);
    posts = [post].concat(posts) // 배열을 맨 앞으로

    res.status(201).json(post)
}

module.exports = {
    index,
    create
}