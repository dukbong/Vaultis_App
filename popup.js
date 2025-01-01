document.addEventListener('DOMContentLoaded', function () {
    const writeTab = document.getElementById('writeTab');
    const encryptTab = document.getElementById('encryptTab');
    const writeTabContent = document.getElementById('writeTabContent');
    const encryptTabContent = document.getElementById('encryptTabContent');
    const sendButton = document.getElementById('sendButton');
    const encryptButton = document.getElementById('encryptButton');
    const contentInput = document.getElementById('content');
    const encryptedContentInput = document.getElementById('encryptedContent');
    const fileInput = document.getElementById('fileInput');
    const encryptFileInput = document.getElementById('encryptFileInput');
    const writeResponse = document.getElementById('writeResponse');
    const encryptResponse = document.getElementById('encryptResponse');

    // 탭 전환
    writeTab.addEventListener('click', () => {
        writeTab.classList.add('active');
        encryptTab.classList.remove('active');
        writeTabContent.classList.add('active');
        encryptTabContent.classList.remove('active');
    });

    encryptTab.addEventListener('click', () => {
        encryptTab.classList.add('active');
        writeTab.classList.remove('active');
        encryptTabContent.classList.add('active');
        writeTabContent.classList.remove('active');
    });

    // 서버로 본문 및 파일 전송
    sendButton.addEventListener('click', () => {
        const content = contentInput.value;
        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('content', content);
        if (file) {
            formData.append('file', file);
        }

        fetch('http://localhost:8889/encrypt', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                writeResponse.value = JSON.stringify(data, null, 2); // 응답 표시
            })
            .catch(error => {
                writeResponse.value = '전송 실패: ' + error; // 오류 메시지 표시
            });
    });

    encryptButton.addEventListener('click', () => {
        const encryptedContent = encryptedContentInput.value;
        const file = encryptFileInput.files[0];

        const formData = new FormData();
        formData.append('encryptedMessage', encryptedContent);
        if (file) {
            formData.append('privateKeyFile', file);
        }

        fetch('http://localhost:8889/decryption', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                encryptResponse.value = data.content || '응답에 content가 없습니다.';
            })
            .catch(error => {
                encryptResponse.value = '전송 실패: ' + error; // 오류 메시지 표시
            });
    });
});
