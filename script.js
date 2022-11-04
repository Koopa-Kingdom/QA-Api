import http from 'k6/http';
import { sleep } from 'k6';
const BASE_URL = 'http://localhost:3000'
export default function () {
  http.get(`${BASE_URL}/qa/questions?product_id=5`);
  sleep(1);
}

