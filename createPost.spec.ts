import { test, expect, request } from '@playwright/test';
// responce structure
interface WordPressPost{
    id: number,
    date: string,
    guid: {
        rendered:string,
        raw:string
    };
    status: string,
    type: string,
    link: string,
    title: {
        rendered:string,
        raw:string
    };
    content: {
        rendered:string,
        raw:string,
        protected: boolean;
    };
}
// test cases
test.describe('createPost', ()=>{
    const baseUrl = 'https://dev.emeli.in.ua/wp-json/wp/v2';
    const creds = Buffer.from('admin:Engineer_123').toString('base64'); // Buffer - auth type
    const perfTimeout = 3000; // expected time
    test('createPostHappyPath', async({request})=>{
        const createStartTime = Date.now();
        // createData == body in Postman
        const createData = {
            title: 'TestTitle',
            content:'Some content',
            status:'publish'
        }
        // const == header in Postman, await for asyn, request == page for UI, post (endpoint)
        const createResponce = await request.post(`${baseUrl}/posts`, {
            headers:{
                'Authorization':`Basic ${creds}`,
                'Content-Type': 'application/json',

            },
            // data createData == Send in Postman
            data: createData
        });
        const createTime = Date.now() - createStartTime;
        // createdPost parsing data from respone body
        const createdPost = await createResponce.json() as WordPressPost;
        console.log('ID is equal: ', `${createdPost.id}`);
        console.log('Title is equal: ', `${createdPost.title.raw}`);
        console.log('Content is equal: ', `${createdPost.content.raw}`);
        // expect == pm.expect in Postman
        expect(createTime).toBeLessThan(perfTimeout);
        expect(createResponce.status()).toBe(201);
        expect (createdPost.id).toBeTruthy();
        expect(createdPost.title.rendered).toBe(createData.title);
        const updateData = {
            title: 'TestTitleUpdated',
            content:'Some content Updated',
            status:'publish'
        }
        const updateResponce = await request.put(`${baseUrl}/posts/${createdPost.id}`, {
            headers:{
                'Authorization':`Basic ${creds}`,
                'Content-Type': 'application/json',

            },
            data: updateData    
    })
    const updatedPost = await updateResponce.json() as WordPressPost;
    console.log('Updaed ID is equal: ', `${updatedPost.id}`);
    console.log('Updated title is equal: ', `${updatedPost.title.raw}`);
    console.log('Updated content is equal: ', `${updatedPost.content.raw}`);
    expect(updateResponce.status()).toBe(200);
    const deleteResponce = await request.delete(`${baseUrl}/posts/${createdPost.id}?force=true`, {
        headers:{
            'Authorization':`Basic ${creds}`

        },
    })
    expect(deleteResponce.status()).toBe(200);
    const getResponce = await request.get(`${baseUrl}/posts/${createdPost.id}`, {
        headers:{
            'Authorization':`Basic ${creds}`
        },
    })
    expect(getResponce.status()).toBe(404);   
})
})