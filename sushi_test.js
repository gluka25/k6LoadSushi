import http from 'k6/http';
import { check, group, sleep } from 'k6'
import { Trend, Counter } from 'k6/metrics'

const BASE_URL = 'http://185.177.93.224:3000';

let mainTrend = new Trend('CUSTOM_root_duration');
let getTrend = new Trend('CUSTOM_get_duration');
let postTrend = new Trend('CUSTOM_post_duration');
let mainTrendCounter = new Counter('CUSTOM_root_count');
let getTrendCounter = new Counter('CUSTOM_get_count');
let postTrendCounter = new Counter('CUSTOM_post_count');

let jsonFile = JSON.parse(open('./order.json'));

export let options = {
    scenarios: {
        main_test: {
            executor: 'ramping-arrival-rate',
            startRate: 10,
            timeUnit: '1s',
            preAllocatedVUs: 10,
            maxVUs: 20,
            stages: [
                { target: 10, duration: '10m' },
                { target: 12, duration: '5m' },
                { target: 14, duration: '5m' },
                { target: 16, duration: '5m' },
                { target: 18, duration: '5m' },
                { target: 20, duration: '5m' }
            ],
            exec: 'get_base'
        },
        /*get_orders_test: {
            executor: 'ramping-arrival-rate',
            startRate: 0,
            timeUnit: '1s',
            preAllocatedVUs: 1,
            maxVUs: 5,
            stages: [
                { target: 1, duration: '5s' }
            ],
            exec: 'get_orders'
        },*/
        make_order_test: {
            executor: 'ramping-arrival-rate',
            startRate: 2,
            timeUnit: '1s',
            preAllocatedVUs: 2,
            maxVUs: 20,
            stages: [
                { target: 2, duration: '10m' },
                { target: 3, duration: '5m' },
                { target: 4, duration: '5m' },
                { target: 5, duration: '5m' },
                { target: 6, duration: '5m' },
                { target: 7, duration: '5m' }
            ],
            exec: 'make_order'
        },
    },
    thresholds: {
        'http_req_duration': ['avg<400', 'p(95)<500']
    }
};

/*export default function () {
    group("get_base", function () { get_base() });
}*/

export function get_base() {
    let res = http.get(BASE_URL);

    mainTrend.add(res.timings.duration);
    mainTrendCounter.add(1);

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}

export function get_orders() {
    let res = http.get(BASE_URL + '/api/orders');

    console.log(`${BASE_URL}` + '/api/orders');
    console.log(res.body);
    console.log(res.status);

    getTrend.add(res.timings.duration);
    getTrendCounter.add(1);
}

export function make_order() {
    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let res = http.post(BASE_URL + '/api/orders', JSON.stringify(jsonFile), params);

    //console.log("make_orders");
    //console.log(res.body);

    check(res, {
        'is status 200': (r) => r.status === 200,
    });

    postTrend.add(res.timings.duration);
    postTrendCounter.add(1);
}