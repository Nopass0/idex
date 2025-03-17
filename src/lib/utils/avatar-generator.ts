/**
 * Генератор аватарок в стиле Apple Watch
 * Создает SVG-аватарки на основе имени и логина пользователя
 */

/**
 * Интерфейс для параметров колец аватарки
 */
interface RingParameters {
  radius: number;
  width: number;
  style: number;
  fillPercentage: number;
}

/**
 * Интерфейс для метаданных аватарки
 */
interface AvatarMetadata {
  name: string;
  login: string;
  seed: number;
  colorScheme: number;
  ringThickness: {
    outer: number;
    middle: number;
    inner: number;
  };
  ringRadii: {
    outer: number;
    middle: number;
    inner: number;
  };
  lineStyles: {
    outer: string;
    middle: string;
    inner: string;
  };
  decorationType: string;
}

/**
 * Интерфейс для вывода функции генерации аватарки
 */
export interface AvatarOutput {
  svg: {
    dark: string;
    light: string;
    color: string;
  };
  metadata: AvatarMetadata;
}

/**
 * Функция хеширования строки
 * @param {string} str - Строка для хеширования
 * @returns {number} - Хеш-значение
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертация в 32-битное целое число
  }
  return Math.abs(hash);
}

/**
 * Получаем название типа декорации на основе первой буквы имени
 * @param {string} name - Имя пользователя 
 * @returns {string} - Название типа декорации
 */
function getDecorationType(name: string | undefined): string {
  const firstCharCode = name && name.length > 0 ? name.charCodeAt(0) % 5 : 0;
  const types = ['точки', 'линии', 'звездочки', 'квадраты', 'треугольники'];
  return types[firstCharCode];
}

/**
 * Получаем первую букву имени
 * @param {string} name - Имя пользователя
 * @returns {string} - Первая буква имени
 */
function getFirstLetter(name: string | undefined): string {
  if (!name || name.length === 0) return 'A';
  
  // Получаем первую букву из имени, обрабатываем русские и английские буквы
  const matches = name.match(/[A-ZА-ЯЁ]/i);
  return matches ? matches[0].toUpperCase() : 'А';
}

/**
 * Получаем цвета для колец на основе хеша
 * @param {number} seed - Хеш-значение
 * @returns {Array} - Массив цветов для колец
 */
function getRingColors(seed: number): string[] {
  // Точно такая же палитра цветов как в исходном коде
  const ringColorPalettes: string[][] = [
    // Классическая палитра Apple Watch
    [
      '#fc3c44', // Красный (движение)
      '#95e12c', // Зеленый (упражнения)
      '#1ebbfa'  // Синий (стоя)
    ],
    // Дополнительные палитры для разнообразия (но в стиле Apple)
    [
      '#ff9500', // Оранжевый
      '#35c759', // Зеленый
      '#007aff'  // Синий
    ],
    [
      '#ff3b30', // Красный
      '#5ac8fa', // Голубой
      '#4cd964'  // Зеленый
    ],
    [
      '#ff2d55', // Розовый
      '#5856d6', // Фиолетовый
      '#ffcc00'  // Желтый
    ],
    [
      '#af52de', // Фиолетовый
      '#ff9500', // Оранжевый
      '#34c759'  // Зеленый
    ],
    [
      '#ff9500', // Оранжевый
      '#00c7be', // Бирюзовый
      '#ff2d55'  // Розовый
    ]
  ];
  
  const paletteIndex = seed % ringColorPalettes.length;
  return ringColorPalettes[paletteIndex];
}

/**
 * Получаем параметры для колец на основе хеша
 * @param {number} seed - Хеш-значение
 * @returns {Object} - Параметры колец
 */
function getRingParameters(seed: number): any {
  // Точно такие же расчеты как в исходном коде
  // 1. Получаем базовые размеры колец (с вариациями)
  const baseOuterRadius = 40 + (seed % 7) - 3; // 37-43
  const baseMiddleRadius = 30 + ((seed >> 4) % 5) - 2; // 28-33
  const baseInnerRadius = 20 + ((seed >> 8) % 5) - 2; // 18-23
  
  // 2. Получаем толщину линий колец (с вариациями)
  const baseOuterWidth = 7 + (seed % 3); // 7-9
  const baseMiddleWidth = 7 + ((seed >> 4) % 3); // 7-9
  const baseInnerWidth = 7 + ((seed >> 8) % 3); // 7-9
  
  // 3. Рассчитываем заполнение колец
  const ringFill1 = 60 + (seed % 40); // 60-100%
  const ringFill2 = 55 + ((seed >> 4) % 45); // 55-100%
  const ringFill3 = 50 + ((seed >> 8) % 50); // 50-100%
  
  // 4. Определяем стили линий
  // 0 - сплошной, 1 - пунктирный, 2 - точечный, 3 - штриховой, 4 - штрих-пунктирный
  const ringStyle1 = seed % 5;
  const ringStyle2 = (seed >> 4) % 5;
  const ringStyle3 = (seed >> 8) % 5;
  
  return {
    outerRadius: baseOuterRadius,
    middleRadius: baseMiddleRadius,
    innerRadius: baseInnerRadius,
    outerWidth: baseOuterWidth,
    middleWidth: baseMiddleWidth,
    innerWidth: baseInnerWidth,
    outerFill: ringFill1,
    middleFill: ringFill2,
    innerFill: ringFill3,
    outerStyle: ringStyle1,
    middleStyle: ringStyle2,
    innerStyle: ringStyle3
  };
}

/**
 * Функция для создания разных стилей dasharray для колец
 * @param {number} percentage - Процент заполнения кольца
 * @param {number} radius - Радиус кольца
 * @param {number} style - Стиль линии
 * @returns {string} - Значение stroke-dasharray
 */
function createRingDasharray(percentage: number, radius: number, style: number): string {
  // Точно такая же логика как в исходном коде
  const circumference = 2 * Math.PI * radius;
  const filledLength = (circumference * percentage) / 100;
  const emptyLength = circumference - filledLength;
  
  // Разные стили линий для лучшей различимости
  switch (style) {
    case 1: // Пунктирный стиль (dashed)
      return `${filledLength * 0.08}, ${emptyLength * 0.02}`;
    case 2: // Точечный стиль (dotted)
      return `${filledLength * 0.02}, ${emptyLength * 0.02}`;
    case 3: // Штрих-пунктирный (dash-dot)
      return `${filledLength * 0.08}, ${emptyLength * 0.01}, ${filledLength * 0.01}, ${emptyLength * 0.01}`;
    case 4: // Широкий штрих с пробелами
      return `${filledLength * 0.2}, ${emptyLength * 0.05}`;
    case 0: // Сплошной стиль (по умолчанию)
    default:
      return `${filledLength}, ${emptyLength}`;
  }
}

/**
 * Создаем декоративные элементы SVG на основе первой буквы имени и хеша
 * @param {number} seed - Хеш-значение
 * @param {Array} ringColors - Цвета колец
 * @param {string} name - Имя пользователя
 * @returns {string} - SVG-элементы для декораций
 */
function createDecorativeElements(seed: number, ringColors: string[], name: string | undefined): string {
  // Тип декоративного элемента на основе первой буквы имени
  const firstCharCode = name && name.length > 0 ? name.charCodeAt(0) % 5 : 0;
  let elementsString = '';
  
  // 1. Добавляем маленькие точки вокруг
  if (firstCharCode === 0) {
    const numDots = 6 + (seed % 6);
    for (let i = 0; i < numDots; i++) {
      const angle = (Math.PI * 2 * i) / numDots;
      const distance = 38 + (seed % 5);
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      const color = ringColors[i % ringColors.length];
      
      elementsString += `<circle cx="${x}" cy="${y}" r="2" fill="${color}" opacity="0.9" />`;
    }
  }
  
  // 2. Добавляем маленькие линии
  else if (firstCharCode === 1) {
    const numLines = 8 + (seed % 4);
    for (let i = 0; i < numLines; i++) {
      const angle = (Math.PI * 2 * i) / numLines;
      const innerRadius = 40;
      const outerRadius = 47;
      const x1 = 50 + Math.cos(angle) * innerRadius;
      const y1 = 50 + Math.sin(angle) * innerRadius;
      const x2 = 50 + Math.cos(angle) * outerRadius;
      const y2 = 50 + Math.sin(angle) * outerRadius;
      const color = ringColors[i % ringColors.length];
      
      elementsString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" opacity="0.8" />`;
    }
  }
  
  // 3. Добавляем звездочки
  else if (firstCharCode === 2) {
    const numStars = 5 + (seed % 3);
    for (let i = 0; i < numStars; i++) {
      const angle = (Math.PI * 2 * i) / numStars;
      const distance = 35 + (seed % 8);
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      const color = ringColors[i % ringColors.length];
      const size = 3 + (seed % 2);
      
      // Создаем маленькую звездочку
      elementsString += `<path d="M ${x},${y-size} L ${x+size/2},${y-size/2} L ${x+size},${y-size} L ${x+size/2},${y} L ${x+size},${y+size} L ${x},${y+size/2} L ${x-size},${y+size} L ${x-size/2},${y} L ${x-size},${y-size} L ${x-size/2},${y-size/2} Z" fill="${color}" opacity="0.9" />`;
    }
  }
  
  // 4. Добавляем маленькие квадраты
  else if (firstCharCode === 3) {
    const numSquares = 4 + (seed % 4);
    for (let i = 0; i < numSquares; i++) {
      const angle = (Math.PI * 2 * i) / numSquares;
      const distance = 36 + (seed % 6);
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      const color = ringColors[i % ringColors.length];
      const size = 3;
      
      elementsString += `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}" transform="rotate(${45 + i * 15}, ${x}, ${y})" opacity="0.9" />`;
    }
  }
  
  // 5. Добавляем маленькие треугольники
  else {
    const numTriangles = 3 + (seed % 4);
    for (let i = 0; i < numTriangles; i++) {
      const angle = (Math.PI * 2 * i) / numTriangles;
      const distance = 37 + (seed % 7);
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      const color = ringColors[i % ringColors.length];
      const size = 4;
      
      // Создаем маленький треугольник
      elementsString += `<polygon points="${x},${y-size} ${x+size},${y+size} ${x-size},${y+size}" fill="${color}" opacity="0.9" />`;
    }
  }
  
  return elementsString;
}

/**
 * Создаем определения (defs) для SVG с градиентами и фильтрами
 * @param {number} seed - Хеш-значение
 * @param {Array} ringColors - Цвета колец
 * @returns {string} - SVG defs элементы
 */
function createDefs(seed: number, ringColors: string[]): string {
  return `<defs>
    <!-- Градиент для фона (если фон цветной) -->
    <linearGradient 
      id="gradient-${seed}" 
      x1="0%" 
      y1="0%" 
      x2="100%" 
      y2="100%" 
      gradientTransform="rotate(${seed % 360}, 0.5, 0.5)"
    >
      <stop offset="0%" stop-color="${ringColors[0]}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${ringColors[2]}" stop-opacity="0.3" />
    </linearGradient>
    
    <!-- Фильтры свечения для колец -->
    <filter id="glow1-${seed}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color="${ringColors[0]}" flood-opacity="0.5" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feComposite in="SourceGraphic" in2="glow" operator="over"/>
    </filter>
    
    <filter id="glow2-${seed}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color="${ringColors[1]}" flood-opacity="0.5" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feComposite in="SourceGraphic" in2="glow" operator="over"/>
    </filter>
    
    <filter id="glow3-${seed}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color="${ringColors[2]}" flood-opacity="0.5" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feComposite in="SourceGraphic" in2="glow" operator="over"/>
    </filter>
  </defs>`;
}

/**
 * Генерирует SVG для аватарки
 * @param {number} seed - Хеш-значение
 * @param {string} name - Имя пользователя
 * @param {string} login - Логин пользователя
 * @param {Array} ringColors - Цвета колец
 * @param {Object} params - Параметры колец
 * @param {string} bgStyle - Стиль фона
 * @returns {Object} - Объект с SVG-строкой
 */
function generateSvg(seed: number, name: string | undefined, login: string | undefined, ringColors: string[], params: any, bgStyle: string): string {
  // Задаем фон в зависимости от выбранного стиля
  let bgFill;
  switch (bgStyle) {
    case 'light':
      bgFill = "#f5f5f7";
      break;
    case 'color':
      bgFill = `url(#gradient-${seed})`;
      break;
    case 'dark':
    default:
      bgFill = "#1d1d1f";
      break;
  }
  
  // Цвет текста в зависимости от фона
  const textColor = bgStyle === 'light' ? "#1d1d1f" : "#ffffff";
  
  // Рассчитываем размер центрального круга с учетом размера внутреннего кольца
  const innerCircleSize = Math.max(10, params.innerRadius - params.innerWidth / 2 - 1);
  
  return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="border-radius: 50%; overflow: hidden;">
  ${createDefs(seed, ringColors)}
  
  <!-- Фон -->
  <circle cx="50" cy="50" r="50" fill="${bgFill}" />
  
  <!-- Кольца активности -->
  <!-- Внешнее кольцо -->
  <circle
    cx="50"
    cy="50"
    r="${params.outerRadius}"
    fill="none"
    stroke="${ringColors[0]}"
    stroke-width="${params.outerWidth}"
    stroke-dasharray="${createRingDasharray(params.outerFill, params.outerRadius, params.outerStyle)}"
    transform="rotate(-90, 50, 50)"
    filter="url(#glow1-${seed})"
  />
  
  <!-- Среднее кольцо -->
  <circle
    cx="50"
    cy="50"
    r="${params.middleRadius}"
    fill="none"
    stroke="${ringColors[1]}"
    stroke-width="${params.middleWidth}"
    stroke-dasharray="${createRingDasharray(params.middleFill, params.middleRadius, params.middleStyle)}"
    transform="rotate(-90, 50, 50)"
    filter="url(#glow2-${seed})"
  />
  
  <!-- Внутреннее кольцо -->
  <circle
    cx="50"
    cy="50"
    r="${params.innerRadius}"
    fill="none"
    stroke="${ringColors[2]}"
    stroke-width="${params.innerWidth}"
    stroke-dasharray="${createRingDasharray(params.innerFill, params.innerRadius, params.innerStyle)}"
    transform="rotate(-90, 50, 50)"
    filter="url(#glow3-${seed})"
  />
  
  <!-- Центральный круг -->
  <circle
    cx="50"
    cy="50"
    r="${innerCircleSize}"
    fill="${bgStyle === 'light' ? "#ffffff" : "#2c2c2e"}"
    stroke="${bgStyle === 'light' ? "#e1e1e6" : "#444446"}"
    stroke-width="0.5"
  />
  
  <!-- Добавляем первую букву имени -->
  <text
    x="50"
    y="50"
    font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="16"
    font-weight="600"
    text-anchor="middle"
    dominant-baseline="central"
    fill="${textColor}"
  >
    ${getFirstLetter(name)}
  </text>
  
  <!-- Декоративные элементы -->
  ${createDecorativeElements(seed, ringColors, name)}
  
  <!-- Тонкая внешняя граница -->
  <circle
    cx="50"
    cy="50"
    r="49"
    fill="none"
    stroke="rgba(255,255,255,0.1)"
    stroke-width="0.5"
  />
</svg>`;
}

/**
 * Генерирует аватарку в определенном стиле
 * @param {string} name - Имя пользователя
 * @param {string} login - Логин пользователя 
 * @param {string} bgStyle - Стиль фона ('dark', 'light' или 'color')
 * @returns {Object} - Объект с SVG-строкой и метаданными
 */
function generateAvatarExact(name: string | undefined, login: string | undefined, bgStyle = 'dark'): any {
  // Гарантируем, что name и login всегда строки
  const safeName = name || '';
  const safeLogin = login || '';
  
  // Вычисляем хеш на основе логина и имени
  const seed = hashString(safeLogin + safeName);
  
  // Получаем цвета для колец
  const ringColors = getRingColors(seed);
  
  // Получаем параметры колец
  const params = getRingParameters(seed);
  
  // Генерируем SVG
  const svgString = generateSvg(seed, safeName, safeLogin, ringColors, params, bgStyle);
  
  // Формируем объект со стилями линий для метаданных
  const lineStyles = ['сплошной', 'пунктирный', 'точечный', 'штрих-пунктир', 'широкий штрих'];
  
  // Формируем объект с метаданными
  const metadata: AvatarMetadata = {
    name: safeName,
    login: safeLogin,
    seed: seed,
    colorScheme: seed % 6 + 1,
    ringThickness: {
      outer: params.outerWidth,
      middle: params.middleWidth,
      inner: params.innerWidth
    },
    ringRadii: {
      outer: params.outerRadius,
      middle: params.middleRadius,
      inner: params.innerRadius
    },
    lineStyles: {
      outer: lineStyles[params.outerStyle],
      middle: lineStyles[params.middleStyle],
      inner: lineStyles[params.innerStyle]
    },
    decorationType: getDecorationType(safeName)
  };
  
  return {
    svg: svgString,
    metadata: metadata
  };
}

/**
 * Генерирует все три варианта аватарок (темная, светлая, цветная)
 * Основная экспортируемая функция для использования в приложении
 * @param {string} name - Имя пользователя
 * @param {string} login - Логин или email пользователя
 * @returns {AvatarOutput} - Объект со всеми вариантами SVG и метаданными
 */
export default function generateAppleWatchAvatar(name: string, login: string): AvatarOutput {
  const dark = generateAvatarExact(name, login, 'dark');
  const light = generateAvatarExact(name, login, 'light');
  const color = generateAvatarExact(name, login, 'color');

  return {
    svg: {
      dark: dark.svg,
      light: light.svg,
      color: color.svg
    },
    metadata: dark.metadata
  };
}
