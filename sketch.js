let stopSprite; // 儲存角色1的停止動作精靈圖
let walkSprite; // 儲存角色1的走路動作精靈圖
let magicSprite; // 儲存角色1的施法動作精靈圖
let magicEffectSprite; // 儲存施法後發射的特效精靈圖
let characterX; // 儲存角色中心點目前的水平位置
let walkDirection = 1; // 設定角色行走方向，1代表向右，-1代表向左
let isWalking = false; // 記錄角色是否已進入持續行走狀態
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartTime = 0; // 記錄施法動畫開始的時間
let magicDirection = 1; // 記錄施法開始時角色面向的方向
let spacePressed = false; // 防止長按空白鍵重複觸發施法
let magicProjectiles = []; // 儲存目前畫面中移動中的魔法特效
const STOP_FRAME_COUNT = 5; // 設定停止動作精靈圖的影格數量
const WALK_FRAME_COUNT = 9; // 設定走路動作精靈圖的影格數量
const MAGIC_FRAME_COUNT = 4; // 設定施法動作精靈圖的影格數量
const MAGIC_EFFECT_FRAME_COUNT = 5; // 設定魔法特效精靈圖的影格數量
const FRAME_DURATION = 100; // 設定每張動畫影格顯示的毫秒數
const WALK_SPEED = 4; // 設定角色每畫格移動的像素數
function preload() { // 在畫布建立前載入角色精靈圖
  stopSprite = loadImage("1/stop/stop.png"); // 載入角色1的停止動作精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色1的走路動作精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色1的施法動作精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入施法後發射的特效精靈圖
} // 結束精靈圖載入函式
function setup() { // 設定全螢幕畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布
  imageMode(CENTER); // 讓圖片的位置座標代表圖片中心點
  characterX = width * (2 / 3); // 將角色初始位置放在畫布寬度的三分之二處
  frameRate(30); // 設定動畫更新速度為每秒30格
} // 結束畫布設定函式
function draw() { // 每一畫格更新背景與角色動畫
  background("#87CEEB"); // 使用天空藍清除並填滿畫布背景
  if (!stopSprite || !walkSprite || !magicSprite || !magicEffectSprite) return; // 圖片尚未載入時略過角色繪製
  const isMoving = !isCasting && keyIsDown(walkDirection === 1 ? RIGHT_ARROW : LEFT_ARROW); // 施法時鎖定角色，否則判斷目前朝向的方向鍵是否按住
  isWalking = isMoving; // 放開方向鍵時切回停止動作
  const castingThisFrame = isCasting; // 記錄本畫格是否正在播放施法動畫
  const characterSprite = castingThisFrame ? magicSprite : isWalking ? walkSprite : stopSprite; // 依角色狀態選擇施法、走路或停止精靈圖
  const frameCount = castingThisFrame ? MAGIC_FRAME_COUNT : isWalking ? WALK_FRAME_COUNT : STOP_FRAME_COUNT; // 依目前動作取得精靈圖影格數量
  const frameWidth = characterSprite.width / frameCount; // 計算目前精靈圖單張影格的原始寬度
  const frameHeight = characterSprite.height; // 取得目前精靈圖單張影格的原始高度
  let frameIndex = floor(millis() / FRAME_DURATION) % frameCount; // 依時間循環選取目前動作的影格
  const scaleFactor = min((height * 0.48) / frameHeight, (width * 0.46) / frameWidth); // 依視窗高寬等比例調整角色大小
  const displayWidth = frameWidth * scaleFactor; // 計算角色顯示寬度
  const displayHeight = frameHeight * scaleFactor; // 計算角色顯示高度
  if (castingThisFrame) { // 正在施法時只播放一次四格動畫
    const elapsedMagicTime = millis() - magicStartTime; // 計算施法動畫已播放的時間
    frameIndex = min(floor(elapsedMagicTime / FRAME_DURATION), MAGIC_FRAME_COUNT - 1); // 依經過時間播放施法影格並停在最後一格
    if (elapsedMagicTime >= MAGIC_FRAME_COUNT * FRAME_DURATION) { // 判斷施法動畫是否已播放完畢
      isCasting = false; // 結束施法狀態並讓角色回到原本動作
      magicProjectiles.push({ x: characterX + magicDirection * displayWidth * 0.35, y: height - displayHeight / 2, direction: magicDirection, scale: scaleFactor, speed: max(6, WALK_SPEED * scaleFactor * 2), startedAt: millis() }); // 依施法方向建立一個飛行中的魔法特效
    } // 結束施法動畫完成判斷
  } // 結束施法動畫處理
  characterX += isMoving ? WALK_SPEED * walkDirection : 0; // 按住方向鍵時依目前方向逐格移動角色
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色完整顯示於畫布左右邊界內
  const characterY = height - displayHeight / 2; // 將角色底部對齊畫布底端
  push(); // 暫存目前的繪圖座標與縮放狀態
  translate(characterX, characterY); // 將繪圖原點移至角色中心位置
  scale(castingThisFrame ? magicDirection : walkDirection, 1); // 依角色目前面向水平翻轉角色圖片
  image(characterSprite, 0, 0, displayWidth, displayHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 裁切並繪製目前的動畫影格
  pop(); // 還原繪圖座標與縮放狀態
  for (let index = magicProjectiles.length - 1; index >= 0; index--) { // 逐一更新畫面中的魔法特效
    const projectile = magicProjectiles[index]; // 取得目前正在更新的魔法特效
    const effectFrameWidth = magicEffectSprite.width / MAGIC_EFFECT_FRAME_COUNT; // 計算特效精靈圖單張影格的原始寬度
    const effectWidth = effectFrameWidth * projectile.scale; // 計算特效顯示寬度
    projectile.x += projectile.speed * projectile.direction; // 依施法方向移動特效
    if ((projectile.direction === 1 && projectile.x - effectWidth / 2 > width) || (projectile.direction === -1 && projectile.x + effectWidth / 2 < 0)) { // 判斷特效是否已完整離開畫布
      magicProjectiles.splice(index, 1); // 移除已離開畫布的特效
      continue; // 略過此特效後續繪製
    } // 結束特效離開畫布判斷
    const effectFrameIndex = floor((millis() - projectile.startedAt) / FRAME_DURATION) % MAGIC_EFFECT_FRAME_COUNT; // 循環選取目前的特效影格
    push(); // 暫存目前的繪圖座標與縮放狀態
    translate(projectile.x, projectile.y); // 將繪圖原點移至特效中心位置
    scale(projectile.direction, 1); // 向左發射時水平翻轉特效圖片
    image(magicEffectSprite, 0, 0, effectWidth, magicEffectSprite.height * projectile.scale, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, magicEffectSprite.height); // 裁切並繪製目前的特效影格
    pop(); // 還原繪圖座標與縮放狀態
  } // 結束魔法特效更新迴圈
} // 結束畫格繪製函式
function keyPressed() { // 按下左右方向鍵時啟動角色行走
  if (keyCode === RIGHT_ARROW && !isCasting) { // 判斷是否在非施法狀態按下鍵盤右方向鍵
    walkDirection = 1; // 設定角色面向右方
    isWalking = true; // 切換至持續播放的走路動畫
  } else if (keyCode === LEFT_ARROW && !isCasting) { // 判斷是否在非施法狀態按下鍵盤左方向鍵
    walkDirection = -1; // 設定角色面向左方
    isWalking = true; // 切換至持續播放的走路動畫
  } else if (keyCode === 32 && !spacePressed && !isCasting) { // 判斷是否首次按下空白鍵且目前沒有施法
    spacePressed = true; // 鎖定空白鍵以防止長按連續施法
    isCasting = true; // 開始播放施法動畫
    magicStartTime = millis(); // 記錄施法動畫開始時間
    magicDirection = walkDirection; // 記錄角色施法時面向的方向
  } // 結束左右方向鍵判斷
} // 結束鍵盤按下事件函式
function keyReleased() { // 處理空白鍵放開事件
  if (keyCode === 32) spacePressed = false; // 放開空白鍵後允許下次施法
} // 結束鍵盤放開事件函式
function windowResized() { // 視窗或載具尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布維持填滿目前視窗
} // 結束視窗尺寸調整函式
