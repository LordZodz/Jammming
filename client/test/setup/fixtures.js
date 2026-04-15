import testImg from '../assets/images/test_album_img.jpeg';

export const sampleTrack = {
    id: '1',
    explicit: false,
    name: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    image: testImg,
    duration: '3:30',
    uri: 'spotify:track:12345',
};

export const explicitSampleTrack = {
    ...sampleTrack,
    id: '2',
    explicit: true,
    name: 'Track Two',
    artist: 'Artist Two',
    album: 'Album Two',
    image: 'test_image_2.jpg',
    duration: '4:00',
    uri: 'spotify:track:2',
};

export const sampleTracklist = [
    {
        ...sampleTrack,
        image: 'test_image_1.jpg',
        name: 'Track One',
        artist: 'Artist One',
        album: 'Album One',
        uri: 'spotify:track:1',
    },
    explicitSampleTrack,
];

export const sampleAppTrack = {
    id: '1',
    name: 'Plug In Baby',
    artist: 'Muse',
    album: 'Origin of Symmetry',
    uri: 'spotify:track:1',
};

export const currentTrack = {
    name: 'Test Track',
    artists: [{ name: 'Test Artist' }],
    album: { name: 'Test Album', images: [{ url: 'test-image.jpg' }] },
};