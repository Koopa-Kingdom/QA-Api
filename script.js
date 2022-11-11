import http from 'k6/http';
import { sleep } from 'k6';
const BASE_URL = 'http://localhost:3000'

export const options = {
  stages: [
    { duration: '10s', target: 10000 }
  ],
};


export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/qa/questions?product_id=5`, null],
    ['PUT', `${BASE_URL}/qa/questions/5/helpful`, null],
    ['PUT', `${BASE_URL}/qa/questions/5/report`, null],
  ]);
}