import http from 'k6/http';
import { check, group, sleep } from 'k6'
import { Trend, Counter } from 'k6/metrics'


const BASE_URL = 'http://185.177.93.224:3000';

let mainTrend = new Trend('CUSTOM_root_duration');
let getTrend = new Trend('CUSTOM_get_duration');
let mainTrendCounter = new Counter('CUSTOM_root_count');
let getTrendCounter = new Counter('CUSTOM_get_count');

export let options = {
    scenarios: {
        main_test: {
            executor: 'ramping-arrival-rate',
            startRate: 0,
            timeUnit: '1s',
            preAllocatedVUs: 2,
            maxVUs: 5,
            stages: [
                { target: 2, duration: '5s' },
                { target: 4, duration: '5s' },
                { target: 0, duration: '1s' },
            ],
            exec:'get_base'
        },
        get_orders_test: {
            executor: 'ramping-arrival-rate',
            startRate: 0,
            timeUnit: '1s',
            preAllocatedVUs: 2,
            maxVUs: 5,
            stages: [
                { target: 1, duration: '5s' },
                { target: 2, duration: '5s' },
                { target: 0, duration: '1s' },
            ],
            exec:'get_orders'
        },
        /*make_order_test: {
            executor: 'ramping-vus',
            //timeUnit:'1s',
            startVUs: 0,
            stages: [
                { duration: '1s', target: 2 },
                { duration: '1s', target: 5 },
                { duration: '1s', target: 0 }
            ],
            gracefulRampDown: '10s',
        },*/
    },
    thresholds: {
        'http_req_duration': ['avg<100', 'p(95)<200']
    }
};

export default function () {
    group("get_base", function () { get_base() });
    group("get_orders", function () { get_orders() });
}

export function get_base() {
    let res = http.get(BASE_URL);
    console.log(`${BASE_URL}`);
    
    mainTrend.add(res.timings.duration);
    mainTrendCounter.add(1);

    check(res, {
        'is status 200': (r) => r.status === 200,
    });

}

export function get_orders() {
    let res = http.get(BASE_URL + '/api/orders');
    console.log("get_orders");
    //console.log(res.body);
    getTrend.add(res.timings.duration);
    getTrendCounter.add(1);
}

//export function make_order() {
//    let res = http.post(BASE_URL + '/api/orders');
//}