let db = {
  users: [
    {
      userId: 'uHpBfXHCyycdv3DNDCIGzWx0vZD3',
      email: 'user@gmail.com',
      handle: 'user',
      createdAt: '2020-01-20T10:39:16.045Z',
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/unsocial-alien.appspot.com/o/no-image.png?alt=media',
      bio: 'Hey , you can write you cool bio here :)',
      website: 'https://website.com',
      location: 'India, bangalore',
    },
  ],
  posts: [
    {
      userHandle: 'user',
      body: 'This is a sample post',
      createdAt: '2020-01-20T10:39:16.045Z',
      likeCount: 10,
      commentCount: 3,
    },
  ],
  comments: [
    {
      userHandle: 'user',
      postId: 'TIAdUWnVGFnDRLUqzaMx',
      body: 'body of the comment',
      createdAt: 'January 21, 2020 at 12:01:00 AM UTC+5:30',
    },
  ],
};
const userDetails = {
  // Redux Data
  credentials: {
    userId: 'uHpBfXHCyycdv3DNDCIGzWx0vZD3',
    email: 'user@gmail.com',
    handle: 'user',
    createdAt: '2020-01-20T10:39:16.045Z',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/unsocial-alien.appspot.com/o/no-image.png?alt=media',
    bio: 'Hey , you can write you cool bio here :)',
    website: 'https://website.com',
    location: 'India, bangalore',
  },
  likes: [
    {
      userHandle: 'user',
      postId: 'hh705oWfWucVzGbHH2pa',
    },
    {
      userHandle: 'user',
      postId: 'jj705oWfWucVGbHH4pa',
    },
  ],
};
