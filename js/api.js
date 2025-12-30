// 调用后端 API 进行数据的加载和保存
import { state } from './config.js';

export async function loadNavDataApi() {
    try {
        const res = await fetch('/nav', {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'appKey': state.appKey},
        });
        return await res.json();
    } catch (err) {
        console.error('load db error', err);
        return [];
    }
}

export async function updateNavDataApi(data) {
    try {
        await fetch('/nav', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'appKey': state.appKey},
            body: JSON.stringify(data)
        });
    } catch (err) {
        console.error('save db error', err);
    }
}