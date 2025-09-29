// Simple test to verify base64 image handling works
const testBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function testUpload() {
  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        images: [testBase64Image] 
      }),
    });

    const result = await response.json();
    console.log('Upload test result:', result);
    
    if (result.success) {
      console.log('✅ Base64 upload working correctly');
      console.log('Returned images:', result.files);
    } else {
      console.log('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

console.log('Testing base64 image upload...');
console.log('Test image data:', testBase64Image.substring(0, 50) + '...');