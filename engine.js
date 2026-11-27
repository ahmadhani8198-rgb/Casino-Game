/* reveal engine adapted from the Gemini prototype: 21 methods */
    const ALL_MODES = [
      'foil', 'flame', 'flip', 'mortar', 'taboon', 'basket',
      'capsule', 'fog', 'bubble', 'ribbon',
      'snap', 'magnet', 'iris', 'rising', 'card3d', 'gauge', 'coffee', 'knife', 'spice', 'cloth', 'lantern'
    ];

    const MODE_META = {
      foil: { hint: "امسح القصدير بإصبعك أو اضغط مطولاً لكشف الطبق! 🪙", icon: "🪙", label: "اكشط تلقائياً الآن!" },
      flame: { hint: "انقر على الفقاعات لفرقعتها أو شغّل الموقد! 🔥", icon: "🔥", label: "أشعل النار واجمع المكونات!" },
      flip: { hint: "قالب نحاسي مقلوب بانتظار العد التنازلي! 🍮", icon: "🍮", label: "ارفع القالب واقلب الطبق!" },
      mortar: { hint: "انقر على الهاون لدق البهارات أو اضغط الزر! 🌿", icon: "🌿", label: "دقّ البهارات وفجّر النكهة!" },
      taboon: { hint: "رغيف طابون ساخن ينتفخ ويتحمّر بالفرن! 🫓", icon: "🫓", label: "انفخ الرغيف وافتحه!" },
      basket: { hint: "سلة خوص مطرّزة تهتز بنعناع وصنوبر! 🧺", icon: "🧺", label: "ارفع غطاء السلة التراثية!" },
      capsule: { hint: "اضغط لتدوير كبسولة الوصفات في الآلة! 🔮", icon: "🔮", label: "اسحب كبسولة الحظ!" },
      fog: { hint: "امسح البخار الكثيف بإصبعك أو اضغط انفخ البخار! 💨", icon: "💨", label: "انفخ البخار الآن!" },
      bubble: { hint: "انقر على الفقاعة القزحية العملاقة لتفجيرها! 🫧", icon: "🫧", label: "فجّر الفقاعة السحرية!" },
      ribbon: { hint: "انقر على العقدة لفك رباط الهدية السرية! 🎀", icon: "🎀", label: "فكّ رباط الهدية!" },
      snap: { hint: "4 مكونات تطير وتندمج لتكوين الطبق! ⚡", icon: "⚡", label: "اجمع المكونات بسرعة!" },
      magnet: { hint: "المغناطيس يجذب كل العناصر نحو المركز! 🧲", icon: "🧲", label: "شغّل المغناطيس!" },
      iris: { hint: "عدسة الكاميرا تفتح شعاع الضوء الدافئ! 📷", icon: "📷", label: "افتح ستارة الضوء!" },
      rising: { hint: "فقاعات الطهي تصعد وتفرقع لتكشف الطبق! 🫧", icon: "🫧", label: "ابدأ الغليان المتصاعد!" },
      card3d: { hint: "انقر على البطاقة التراثية لقلبها 180 درجة! 🃏", icon: "🃏", label: "اقلب البطاقة 3D!" },
      gauge: { hint: "عدّاد الشهية يقيس مستوى الوجبة القادمة! 🧭", icon: "🧭", label: "شغّل عدّاد الشهية!" },
      coffee: { hint: "تموجات القهوة العربية تعكس طبقك القادم! ☕", icon: "☕", label: "اكتشف الانعكاس!" },
      knife: { hint: "ضربة سكين سريعة تفتح الشرائح كالمروحة! 🔪", icon: "🔪", label: "اقطع الشرائح الآن!" },
      spice: { hint: "موجات الزعفران والسماق تزيح الستار! 🌊", icon: "🌊", label: "أطلق موجة التوابل!" },
      cloth: { hint: "انقر لرفع منديل السفرة المطرّز بأناقة! 🪡", icon: "🪡", label: "ارفع السفرة القماشية!" },
      lantern: { hint: "ضوء الفانوس الدافئ يبدد الظل ويكشف النجم! 🏮", icon: "🏮", label: "أشعل ضوء الفانوس!" }
    };

    let activeMode = 'foil';
    let mealFilter = 'all';
    let currentDish = null;
    let isBusy = false;
    let soundOn = true;
    let audioCtx = null;
    let timers = [];
    let intervals = [];

    // متغيرات تفاعلية خاصة
    let isScratching = false;
    let holdInterval = null;
    let wipeCompleted = false;
    let lastNoiseTime = 0;
    let poppedBubbles = 0;
    let mortarHits = 0;

    // =========================================================================
    // محرك الصوت التوليدي (Web Audio API)
    // =========================================================================
    function ensureAudio() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function toggleSound() {
      soundOn = !soundOn;
      document.getElementById('soundIcon').textContent = soundOn ? '🔊' : '🔇';
      if (soundOn) playPopTone(620);
    }

    // صوت خربشة القصدير أو حفيف القماش/البخار
    function playNoiseBurst(freq = 3200, duration = 0.08, vol = 0.14, type = 'bandpass') {
      if (!soundOn) return;
      const nowMs = Date.now();
      if (nowMs - lastNoiseTime < 65) return;
      lastNoiseTime = nowMs;

      ensureAudio();
      const now = audioCtx.currentTime;
      const len = Math.floor(audioCtx.sampleRate * duration);
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      const src = audioCtx.createBufferSource();
      src.buffer = buf;

      const filter = audioCtx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = 2.5;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      src.start(now);
    }

    // صوت بوب / دق هاون / تك
    function playPopTone(freq = 440, wave = 'sine', dur = 0.09, vol = 0.22) {
      if (!soundOn) return;
      ensureAudio();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq * 0.7, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + dur * 0.85);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    }

    // صوت دقة الهاون المعدنية الدافئة
    function playMortarClink(step = 1) {
      if (!soundOn) return;
      ensureAudio();
      const now = audioCtx.currentTime;
      [320 + step * 35, 960 + step * 70].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.55, now + 0.16);
        gain.gain.setValueAtTime(i === 0 ? 0.28 : 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    }

    // صوت شحذ السكين المعدني الحاد
    function playKnifeSliceSound() {
      if (!soundOn) return;
      ensureAudio();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3400, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }

    // نغمة الكشف الاحتفالية المبهجة
    function playGrandChime() {
      if (!soundOn) return;
      ensureAudio();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const t = now + idx * 0.065;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    }

    // =========================================================================
    // إدارة الفلاتر واختيار الطبق والوضع
    // =========================================================================
    function pickDish() { return window.__revealDish; }

    function fillCardData(dish) { currentDish = dish; window.fillRevealCard(dish); }

    function clearTimers() {
      timers.forEach(t => clearTimeout(t));
      intervals.forEach(i => clearInterval(i));
      timers = [];
      intervals = [];
      if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
    }

    
    function selectMode(mode) {
      if (isBusy) return;
      activeMode = mode;

      document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('border-[#d97706]', 'bg-[#fef3c7]', 'text-[#4a2c18]', 'shadow-sm');
        tab.classList.add('border-transparent', 'bg-[#f6ece0]', 'text-[#5d4037]');
      });
      const sel = document.getElementById(`mode-${mode}`);
      if (sel) {
        sel.classList.add('border-[#d97706]', 'bg-[#fef3c7]', 'text-[#4a2c18]', 'shadow-sm');
        sel.classList.remove('border-transparent', 'bg-[#f6ece0]', 'text-[#5d4037]');
      }
      setupStage();
    }

    
    function setupStage() {
      clearTimers();
      isBusy = false;
      wipeCompleted = false;

      const meta = MODE_META[activeMode];
      const hint = document.getElementById('stageHint');
      hint.textContent = meta.hint;
      hint.classList.remove('hidden');

      const btn = document.getElementById('revealBtn');
      btn.disabled = false;
      document.getElementById('btnIcon').textContent = meta.icon;
      document.getElementById('btnLabel').textContent = meta.label;

      document.getElementById('sunbeams').classList.remove('active');
      document.getElementById('garnishLayer').innerHTML = '';
      document.getElementById('burstLayer').innerHTML = '';
      const flash = document.getElementById('flashLayer');
      flash.classList.add('hidden');
      flash.classList.remove('flash-overlay');

      const card = document.getElementById('revealCard');
      card.classList.add('hidden');
      card.classList.remove('reveal-card-anim');
      const sweep = document.getElementById('goldenSweep');
      sweep.classList.add('hidden');
      sweep.classList.remove('golden-shine-bar');

      document.querySelectorAll('.mode-scene').forEach(s => s.classList.add('hidden'));
      document.getElementById(`scene-${activeMode}`).classList.remove('hidden');

      const dish = pickDish();
      fillCardData(dish);

      // تهيئة كل وضع حسب طبيعته
      if (activeMode === 'foil') initWipeCanvas('foilCanvas', 'foilWrapper', 'foilPercent', true);
      else if (activeMode === 'fog') initWipeCanvas('fogCanvas', 'fogWrapper', 'fogPercent', false);
      else if (activeMode === 'flame') initFlameMode(dish);
      else if (activeMode === 'flip') initFlipMode();
      else if (activeMode === 'mortar') initMortarMode();
      else if (activeMode === 'taboon') initTaboonMode();
      else if (activeMode === 'basket') initBasketMode();
      else if (activeMode === 'capsule') initCapsuleMode(dish);
      else if (activeMode === 'bubble') initGiantBubbleMode(dish);
      else if (activeMode === 'ribbon') initRibbonMode();
      else if (activeMode === 'snap') initSnapMode();
      else if (activeMode === 'magnet') initMagnetMode();
      else if (activeMode === 'iris') initIrisMode();
      else if (activeMode === 'rising') initRisingBubblesMode();
      else if (activeMode === 'card3d') initCard3DMode();
      else if (activeMode === 'gauge') initGaugeMode();
      else if (activeMode === 'coffee') initCoffeeMode(dish);
      else if (activeMode === 'knife') initKnifeMode();
      else if (activeMode === 'spice') initSpiceMode();
      else if (activeMode === 'cloth') initClothMode();
      else if (activeMode === 'lantern') initLanternMode();
    }

    function showFinalCard(customMsg = 'صحة وعافية! هذه وصفتك المختارة 🎉', extraIcons = ['✨', '⭐', '🌟']) {
      document.querySelectorAll('.mode-scene').forEach(s => s.classList.add('hidden'));
      document.getElementById('sunbeams').classList.add('active');
      document.getElementById('stageHint').textContent = customMsg;

      const card = document.getElementById('revealCard');
      card.classList.remove('hidden', 'reveal-card-anim');
      void card.offsetWidth;
      card.classList.add('reveal-card-anim');

      playGrandChime();
      triggerBurst(extraIcons);

      isBusy = false;
      const btn = document.getElementById('revealBtn');
      btn.disabled = false;
      document.getElementById('btnIcon').textContent = '👌';
      document.getElementById('btnLabel').textContent = 'تمام، صحة وعافية';
      if (window.onRevealDone) window.onRevealDone();
    }

    // =========================================================================
    // 1 & 8. كشط القصدير أو نفخ البخار (Canvas Interactive Wipe)
    // =========================================================================
    function initWipeCanvas(canvasId, wrapperId, percentId, isFoil) {
      wipeCompleted = false;
      const card = document.getElementById('revealCard');
      card.classList.remove('hidden');
      document.getElementById(percentId).textContent = '0';

      const canvas = document.getElementById(canvasId);
      const wrapper = document.getElementById(wrapperId);
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width || 260;
      canvas.height = rect.height || 230;

      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';

      if (isFoil) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#cbd5e1');
        grad.addColorStop(0.3, '#f8fafc');
        grad.addColorStop(0.55, '#94a3b8');
        grad.addColorStop(0.8, '#e2e8f0');
        grad.addColorStop(1, '#64748b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;
        for (let y = 16; y < canvas.height; y += 20) {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 20) {
            const w = Math.sin((x + y) * 0.08) * 3;
            x === 0 ? ctx.moveTo(x, y + w) : ctx.lineTo(x, y + w);
          }
          ctx.stroke();
        }
        ctx.fillStyle = '#334155';
        ctx.font = '900 17px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ طبق مغلّف بالقصدير ✨', canvas.width / 2, canvas.height / 2 - 6);
        ctx.font = '700 12px Cairo, sans-serif';
        ctx.fillText('امسح بإصبعك أو اضغط مطولاً', canvas.width / 2, canvas.height / 2 + 18);
      } else {
        // طبقة بخار ودخان توابل كثيف مع قطرات تكثف
        const fogGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 15, canvas.width / 2, canvas.height / 2, 170);
        fogGrad.addColorStop(0, 'rgba(255, 251, 235, 0.97)');
        fogGrad.addColorStop(0.65, 'rgba(243, 232, 210, 0.96)');
        fogGrad.addColorStop(1, 'rgba(217, 198, 170, 0.98)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // قطرات تكثف وسحب بخار
        for (let i = 0; i < 28; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 4 + Math.random() * 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fill();
        }
        ctx.fillStyle = '#78350f';
        ctx.font = '900 17px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💨 بخار الطهي الكثيف 💨', canvas.width / 2, canvas.height / 2 - 6);
        ctx.font = '700 12px Cairo, sans-serif';
        ctx.fillText('امسح البخار أو اضغط انفخ!', canvas.width / 2, canvas.height / 2 + 18);
      }

      let rHold = 20;
      function eraseAt(cx, cy, rad = 28) {
        if (wipeCompleted) return;
        const b = canvas.getBoundingClientRect();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx - b.left, cy - b.top, rad, 0, Math.PI * 2);
        ctx.fill();

        if (isFoil) playNoiseBurst(3400, 0.07, 0.14);
        else playNoiseBurst(520, 0.09, 0.12, 'lowpass');

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let cleared = 0, total = 0;
        for (let i = 3; i < data.length; i += 64) {
          total++;
          if (data[i] < 128) cleared++;
        }
        const pct = Math.min(100, Math.round((cleared / total) * 100));
        document.getElementById(percentId).textContent = pct;
        if (pct >= 55) finishWipe(canvas, isFoil);
      }

      function startHold(cx, cy) {
        isScratching = true;
        rHold = 22;
        eraseAt(cx, cy, rHold);
        if (holdInterval) clearInterval(holdInterval);
        holdInterval = setInterval(() => {
          if (!isScratching || wipeCompleted) { clearInterval(holdInterval); return; }
          rHold += 11;
          eraseAt(cx, cy, rHold);
        }, 65);
      }
      function endHold() {
        isScratching = false;
        if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
      }

      canvas.onmousedown = (e) => startHold(e.clientX, e.clientY);
      canvas.onmousemove = (e) => {
        if (!isScratching) return;
        if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
        eraseAt(e.clientX, e.clientY, 28);
      };
      window.addEventListener('mouseup', endHold);

      canvas.ontouchstart = (e) => { e.preventDefault(); startHold(e.touches[0].clientX, e.touches[0].clientY); };
      canvas.ontouchmove = (e) => {
        e.preventDefault();
        if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
        eraseAt(e.touches[0].clientX, e.touches[0].clientY, 30);
      };
      canvas.ontouchend = endHold;
    }

    function finishWipe(canvas, isFoil) {
      if (wipeCompleted) return;
      wipeCompleted = true;
      if (holdInterval) clearInterval(holdInterval);

      if (isFoil) {
        const flash = document.getElementById('flashLayer');
        flash.classList.remove('hidden');
        flash.classList.add('flash-overlay');
      }
      showFinalCard(isFoil ? 'انكشف الطبق الساخن من القصدير! ✨' : 'انقشع البخار وظهرت الأكلة الشهيّة! 💨', ['✨', '⭐', '🔥']);
    }

    function autoWipeCanvas(isFoil) {
      if (wipeCompleted) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;
      const canvas = document.getElementById(isFoil ? 'foilCanvas' : 'fogCanvas');
      const ctx = canvas.getContext('2d');
      let rad = 18;
      const intv = setInterval(() => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, rad, 0, Math.PI * 2);
        ctx.fill();
        if (isFoil) playNoiseBurst(3400, 0.07, 0.14);
        else playNoiseBurst(520, 0.09, 0.12, 'lowpass');
        rad += 20;
        if (rad >= 200) {
          clearInterval(intv);
          finishWipe(canvas, isFoil);
        }
      }, 45);
      intervals.push(intv);
    }

    // =========================================================================
    // 2. شعلة الموقد والغليان السحري
    // =========================================================================
    function initFlameMode(dish) {
      poppedBubbles = 0;
      const container = document.getElementById('bubblesContainer');
      container.innerHTML = '';
      document.getElementById('stoveFlameBox').style.transform = 'scale(0.85)';
      document.getElementById('flamePowerText').textContent = 'الطاقة: 0 / 5 🔥';

      const items = [...dish.ingredients, '🌶️'].slice(0, 5);
      const pos = [
        { top: '6%', left: '16%' }, { top: '6%', right: '16%' },
        { top: '42%', left: '3%' }, { top: '42%', right: '3%' },
        { bottom: '8%', left: '16%' }
      ];
      items.forEach((ic, idx) => {
        const b = document.createElement('button');
        b.className = 'ingredient-bubble absolute w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-400 shadow-md flex items-center justify-center text-xl cursor-pointer';
        b.textContent = ic;
        b.style.animationDelay = `${idx * 0.2}s`;
        Object.assign(b.style, pos[idx]);
        b.onclick = (e) => { e.stopPropagation(); popFlameBubble(b); };
        container.appendChild(b);
      });
    }

    function popFlameBubble(el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      poppedBubbles++;
      playPopTone(420 + poppedBubbles * 85);
      playNoiseBurst(360, 0.18, 0.15, 'lowpass');
      el.style.transform = 'scale(1.5)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 170);

      document.getElementById('stoveFlameBox').style.transform = `scale(${0.85 + poppedBubbles * 0.1})`;
      document.getElementById('flamePowerText').textContent = `الطاقة: ${poppedBubbles} / 5 🔥`;
      if (poppedBubbles >= 5) {
        timers.push(setTimeout(() => showFinalCard('اكتمل الطبخ على نار حامية! 🔥🍲', ['🔥', '🌿', '⭐']), 240));
      }
    }

    function energizeFlame() {
      const rem = document.querySelectorAll('#bubblesContainer button:not([data-done="1"])');
      if (rem.length > 0) rem[0].click();
    }

    function runAutoFlame() {
      if (document.getElementById('scene-flame').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;
      const intv = setInterval(() => {
        const rem = document.querySelectorAll('#bubblesContainer button:not([data-done="1"])');
        if (rem.length > 0) rem[0].click();
        else clearInterval(intv);
      }, 220);
      intervals.push(intv);
    }

    // =========================================================================
    // 3. القالب المقلوب (مقلوبة / كنافة)
    // =========================================================================
    function initFlipMode() {
      const mold = document.getElementById('upsideDownMold');
      mold.classList.remove('mold-wobbling', 'mold-lifted');
      mold.style.setProperty('--lift', '0px');
      mold.style.transform = 'translateY(0)';
      mold.style.opacity = '1';
      document.getElementById('flipCountdownBadge').classList.add('hidden');
    }

    function runFlipMode() {
      if (document.getElementById('scene-flip').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;
      const mold = document.getElementById('upsideDownMold');
      const badge = document.getElementById('flipCountdownBadge');
      badge.classList.remove('hidden');

      let c = 3;
      badge.textContent = c;
      mold.classList.add('mold-wobbling');
      playPopTone(440, 'triangle');

      const intv = setInterval(() => {
        c--;
        if (c > 0) {
          badge.textContent = c;
          mold.style.setProperty('--lift', `${(3 - c) * -12}px`);
          playPopTone(440 + (3 - c) * 110, 'triangle');
        } else {
          clearInterval(intv);
          badge.classList.add('hidden');
          mold.classList.remove('mold-wobbling');
          mold.classList.add('mold-lifted');
          playPopTone(680, 'triangle', 0.25, 0.28);

          timers.push(setTimeout(() => {
            showFinalCard('هوب! انكشف الطبق بطبقاته الذهبية ✨', ['🍯', '💚', '⭐']);
            const sweep = document.getElementById('goldenSweep');
            sweep.classList.remove('hidden');
            sweep.classList.add('golden-shine-bar');
          }, 340));
        }
      }, 500);
      intervals.push(intv);
    }

    // =========================================================================
    // 4. خلط البهارات في الهاون (Mortar & Pestle)
    // =========================================================================
    function initMortarMode() {
      mortarHits = 0;
      document.getElementById('mortarCountBadge').textContent = 'الدقّات: 0 / 5 🌿';
    }

    function poundMortarOnce() {
      if (mortarHits >= 5) return;
      mortarHits++;
      playMortarClink(mortarHits);

      const pestle = document.getElementById('pestleEl');
      const box = document.getElementById('mortarBox');
      pestle.classList.remove('pestle-pounding');
      box.classList.remove('mortar-recoil');
      void pestle.offsetWidth;
      pestle.classList.add('pestle-pounding');
      box.classList.add('mortar-recoil');

      document.getElementById('mortarCountBadge').textContent = `الدقّات: ${mortarHits} / 5 🌿`;
      // تطاير غبار بهارات ذهبي ونجوم
      triggerBurst(['✨', '🟡', '🌿', '🟠']);

      if (mortarHits >= 5) {
        timers.push(setTimeout(() => {
          showerGarnish(['🌿', '🟡', '🟠', '✨']);
          showFinalCard('فاحت رائحة البهارات الطازجة وانكشف الطبق! 🌿✨', ['✨', '🌿', '⭐']);
        }, 320));
      }
    }

    function runAutoMortar() {
      if (document.getElementById('scene-mortar').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;
      const intv = setInterval(() => {
        if (mortarHits < 5) poundMortarOnce();
        else clearInterval(intv);
      }, 280);
      intervals.push(intv);
    }

    // =========================================================================
    // 5. الخبز المنفوخ في الفرن / الطابون (Puffed Taboon Bread)
    // =========================================================================
    function initTaboonMode() {
      const whole = document.getElementById('taboonBreadWhole');
      whole.classList.remove('bread-puffing');
      document.getElementById('breadLeftHalf').classList.remove('bread-half-left');
      document.getElementById('breadRightHalf').classList.remove('bread-half-right');
    }

    function runTaboonMode() {
      if (document.getElementById('scene-taboon').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const whole = document.getElementById('taboonBreadWhole');
      whole.classList.add('bread-puffing');
      document.getElementById('stageHint').textContent = 'ينتفخ الرغيف ويتحمّر على جمر الطابون... 🔥';
      playNoiseBurst(420, 0.9, 0.14, 'lowpass');

      timers.push(setTimeout(() => {
        document.getElementById('breadLeftHalf').classList.add('bread-half-left');
        document.getElementById('breadRightHalf').classList.add('bread-half-right');
        playPopTone(560, 'triangle', 0.2, 0.25);

        timers.push(setTimeout(() => {
          showFinalCard('انشق رغيف الطابون الساخن عن وجبتك! 🫓🔥', ['🫓', '🔥', '✨']);
        }, 340));
      }, 1450));
    }

    // =========================================================================
    // 6. السلة التراثية المنسوجة
    // =========================================================================
    function initBasketMode() {
      const lid = document.getElementById('heritageBasketLid');
      lid.classList.remove('basket-shaking', 'basket-opened');
      lid.style.opacity = '1';
    }

    function runBasketMode() {
      if (document.getElementById('scene-basket').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const lid = document.getElementById('heritageBasketLid');
      lid.classList.add('basket-shaking');
      showerGarnish(['🌿', '🥜', '🍃', '✨']);
      playNoiseBurst(1800, 0.35, 0.12);

      timers.push(setTimeout(() => {
        lid.classList.remove('basket-shaking');
        lid.classList.add('basket-opened');
        playPopTone(1174, 'sine', 0.6, 0.25);

        timers.push(setTimeout(() => {
          showFinalCard('هدية تراثية شهيّة من السلة المنسوجة! 🧺✨', ['🌿', '🫒', '✨']);
        }, 360));
      }, 1050));
    }

    // =========================================================================
    // 7. كبسولة الوصفات (Gachapon)
    // =========================================================================
    function initCapsuleMode(dish) {
      const cap = document.getElementById('gachaponCapsule');
      cap.classList.remove('capsule-tumbling');
      document.getElementById('capsuleTopHalf').classList.remove('cap-top-open');
      document.getElementById('capsuleBottomHalf').classList.remove('cap-bottom-open');
      document.getElementById('capsuleBelt').style.opacity = '1';
      const colors = { lunch: '#16a34a', dinnerHot: '#ea580c', coldMezze: '#0d9488', dessert: '#db2777' };
      document.getElementById('capsuleColorFill').setAttribute('fill', colors[dish.category] || '#f59e0b');
    }

    function runCapsuleMode() {
      if (document.getElementById('scene-capsule').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const cap = document.getElementById('gachaponCapsule');
      cap.classList.add('capsule-tumbling');
      let t = 0;
      const intv = setInterval(() => { playPopTone(480 + t * 45, 'square', 0.05, 0.1); t++; }, 160);
      intervals.push(intv);

      timers.push(setTimeout(() => {
        clearInterval(intv);
        cap.classList.remove('capsule-tumbling');
        document.getElementById('capsuleBelt').style.opacity = '0';
        document.getElementById('capsuleTopHalf').classList.add('cap-top-open');
        document.getElementById('capsuleBottomHalf').classList.add('cap-bottom-open');
        playPopTone(780);

        timers.push(setTimeout(() => {
          showFinalCard('مبروك! طلعت لك هذه الأكلة من الكبسولة 🔮🎉', ['🔮', '⭐', '✨']);
        }, 340));
      }, 1350));
    }

    // =========================================================================
    // 9. الفقاعة السحرية المنفجرة (Magic Bubble Pop)
    // =========================================================================
    function initGiantBubbleMode(dish) {
      const b = document.getElementById('giantMagicBubble');
      b.style.transform = 'scale(1)';
      b.style.opacity = '1';
      window.putDishVisual(document.getElementById('bubbleSilhouetteEmoji'), dish, 96);
    }

    function popGiantMagicBubble() {
      if (document.getElementById('scene-bubble').classList.contains('hidden')) { setupStage(); return; }
      if (isBusy) return;
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const b = document.getElementById('giantMagicBubble');
      playPopTone(680, 'sine', 0.14, 0.28);
      b.style.transform = 'scale(1.38)';
      b.style.opacity = '0';

      timers.push(setTimeout(() => {
        showFinalCard('بوب! انفجرت الفقاعة السحرية عن طبقك 🫧✨', ['💧', '🫧', '✨', '⭐']);
      }, 220));
    }

    // =========================================================================
    // 10. فكّ رباط الهدية (Gift Ribbon Untie)
    // =========================================================================
    function initRibbonMode() {
      document.getElementById('giftPanelTop').style.transform = 'translateY(0)';
      document.getElementById('giftPanelBottom').style.transform = 'translateY(0)';
      document.getElementById('ribbonVert').style.opacity = '1';
      document.getElementById('ribbonHoriz').style.opacity = '1';
      const bow = document.getElementById('ribbonBow');
      bow.style.transform = 'scale(1)';
      bow.style.opacity = '1';
      bow.classList.remove('ribbon-shaking');
    }

    function untieGiftRibbon() {
      if (document.getElementById('scene-ribbon').classList.contains('hidden')) { setupStage(); return; }
      if (isBusy) return;
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const bow = document.getElementById('ribbonBow');
      bow.classList.add('ribbon-shaking');
      playNoiseBurst(2200, 0.25, 0.14);

      timers.push(setTimeout(() => {
        bow.classList.remove('ribbon-shaking');
        bow.style.transform = 'scale(1.4)';
        bow.style.opacity = '0';
        document.getElementById('ribbonVert').style.opacity = '0';
        document.getElementById('ribbonHoriz').style.opacity = '0';
        document.getElementById('giftPanelTop').style.transform = 'translateY(-110%)';
        document.getElementById('giftPanelBottom').style.transform = 'translateY(110%)';

        timers.push(setTimeout(() => {
          showerGarnish(['🎊', '⭐', '✨', '🎀']);
          showFinalCard('انفك رباط الهدية وظهرت وجبتك! 🎀🎉', ['🎀', '✨', '⭐']);
        }, 380));
      }, 650));
    }

    // =========================================================================
    // 11. تجميع المكونات السريع (Ingredient Snap Assembly)
    // =========================================================================
    function initSnapMode() {
      document.getElementById('snapIngredientsLayer').innerHTML = '';
      document.getElementById('snapTargetRing').style.transform = 'scale(1)';
    }

    function runSnapMode() {
      if (document.getElementById('scene-snap').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const layer = document.getElementById('snapIngredientsLayer');
      layer.innerHTML = '';
      const corners = [
        { sx: '-115px', sy: '-95px', rot: '-45deg' },
        { sx: '115px', sy: '-95px', rot: '45deg' },
        { sx: '-115px', sy: '95px', rot: '-35deg' },
        { sx: '115px', sy: '95px', rot: '35deg' }
      ];

      currentDish.ingredients.forEach((em, idx) => {
        const el = document.createElement('div');
        el.className = 'snap-ingredient absolute w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 shadow-lg flex items-center justify-center text-3xl';
        el.textContent = em;
        el.style.setProperty('--sx', corners[idx % 4].sx);
        el.style.setProperty('--sy', corners[idx % 4].sy);
        el.style.setProperty('--srot', corners[idx % 4].rot);
        el.style.animationDelay = `${idx * 0.13}s`;
        layer.appendChild(el);
        timers.push(setTimeout(() => playPopTone(350 + idx * 120, 'sine', 0.12, 0.16), idx * 130));
      });

      timers.push(setTimeout(() => {
        document.getElementById('snapTargetRing').style.transform = 'scale(1.3)';
        timers.push(setTimeout(() => {
          showFinalCard('سناب! اندمجت المكونات وكوّنت الطبق الكامل ⚡🍽️', ['⚡', '✨', '⭐']);
        }, 180));
      }, 1400));
    }

    // =========================================================================
    // 12. مغناطيس المكونات (Ingredient Magnet)
    // =========================================================================
    function initMagnetMode() {
      document.getElementById('magnetParticlesLayer').innerHTML = '';
      document.getElementById('magnetCore').style.transform = 'scale(1)';
    }

    function runMagnetMode() {
      if (document.getElementById('scene-magnet').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const layer = document.getElementById('magnetParticlesLayer');
      layer.innerHTML = '';
      const pool = [...currentDish.ingredients, ...currentDish.ingredients];

      pool.forEach((em, idx) => {
        const angle = (Math.PI * 2 * idx) / pool.length;
        const dist = 125;
        const el = document.createElement('div');
        el.className = 'magnet-particle absolute w-11 h-11 rounded-full bg-white border-2 border-red-400 shadow flex items-center justify-center text-2xl';
        el.textContent = em;
        el.style.setProperty('--mx', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--my', `${Math.sin(angle) * dist}px`);
        el.style.animationDelay = `${idx * 0.08}s`;
        layer.appendChild(el);
        timers.push(setTimeout(() => playPopTone(400 + idx * 55, 'triangle', 0.08, 0.14), idx * 80));
      });

      timers.push(setTimeout(() => {
        document.getElementById('magnetCore').style.transform = 'scale(1.35)';
        timers.push(setTimeout(() => {
          showFinalCard('انجذبت كل المكونات بقوة المغناطيس! 🧲✨', ['🧲', '⚡', '⭐']);
        }, 200));
      }, 1350));
    }

    // =========================================================================
    // 13. ستارة الضوء / عدسة الكاميرا (Iris Spotlight Aperture)
    // =========================================================================
    function initIrisMode() {
      const box = document.getElementById('scene-iris');
      box.style.backgroundColor = '#1c130d';
      const circle = document.getElementById('irisApertureCircle');
      circle.style.transform = 'scale(1)';
      circle.style.opacity = '1';
    }

    function runIrisMode() {
      if (document.getElementById('scene-iris').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const circle = document.getElementById('irisApertureCircle');
      playPopTone(520, 'sine', 0.35, 0.2);
      circle.style.transform = 'scale(7.5)';
      circle.style.backgroundColor = 'rgba(254, 243, 199, 0.95)';

      timers.push(setTimeout(() => {
        showFinalCard('سطع الطبق تحت أضواء المسرح! 📷✨', ['🌟', '✨', '⭐']);
      }, 650));
    }

    // =========================================================================
    // 14. فقاعات الطهي / الغليان المتصاعد (Rising Simmer Bubbles)
    // =========================================================================
    function initRisingBubblesMode() {
      document.getElementById('risingBubblesLayer').innerHTML = '';
    }

    function runRisingBubblesMode() {
      if (document.getElementById('scene-rising').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const layer = document.getElementById('risingBubblesLayer');
      let count = 0;
      const intv = setInterval(() => {
        count++;
        playPopTone(380 + count * 45, 'sine', 0.08, 0.16);
        const b = document.createElement('div');
        const size = 26 + Math.random() * 28;
        b.className = 'absolute rounded-full bg-amber-300/60 border-2 border-amber-500 transition-all duration-500';
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${15 + Math.random() * 70}%`;
        b.style.bottom = '0px';
        layer.appendChild(b);

        requestAnimationFrame(() => {
          b.style.transform = `translateY(-${120 + Math.random() * 80}px) scale(1.3)`;
          b.style.opacity = '0';
        });
        setTimeout(() => b.remove(), 520);

        if (count >= 10) {
          clearInterval(intv);
          timers.push(setTimeout(() => {
            showFinalCard('اكتمل الغليان وتشكّلت وجبتك! 🫧🍲', ['🫧', '✨', '⭐']);
          }, 260));
        }
      }, 130);
      intervals.push(intv);
    }

    // =========================================================================
    // 15. البطاقة المقلوبة ثلاثية الأبعاد (3D Heritage Card Flip)
    // =========================================================================
    function initCard3DMode() {
      const inner = document.getElementById('card3dInner');
      inner.classList.remove('rotate-y-180');
      document.getElementById('card3dFrontSlot').innerHTML = '';
    }

    function flip3DCardNow() {
      if (document.getElementById('scene-card3d').classList.contains('hidden')) { setupStage(); return; }
      if (isBusy) return;
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      // نسخ محتوى البطاقة إلى الوجه الأمامي للبطاقة 3D
      const cardClone = document.getElementById('revealCard').innerHTML;
      document.getElementById('card3dFrontSlot').innerHTML = cardClone;

      playNoiseBurst(1600, 0.25, 0.15);
      document.getElementById('card3dInner').classList.add('rotate-y-180');

      timers.push(setTimeout(() => {
        showFinalCard('انقلبت البطاقة التراثية وكشفت وصفة اليوم! 🃏✨', ['🃏', '✨', '⭐']);
      }, 850));
    }

    // =========================================================================
    // 16. الميزان أو عدّاد الشهية (Appetite Meter Gauge)
    // =========================================================================
    function initGaugeMode() {
      document.getElementById('gaugeNeedleGroup').style.transform = 'rotate(-75deg)';
      document.getElementById('gaugeStatusLabel').textContent = 'عدّاد الشهية جاهز للقياس! 🧭';
    }

    function runGaugeMode() {
      if (document.getElementById('scene-gauge').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const needle = document.getElementById('gaugeNeedleGroup');
      const label = document.getElementById('gaugeStatusLabel');
      const angles = [-68, -22, 22, 68];
      const names = ['خفيف ومنعش 🥗', 'دسم ومشبّع 🍖', 'حار ومبهّر 🌶️', 'حلو ولذيذ 🍯'];

      let step = 0;
      const intv = setInterval(() => {
        const idx = step % 4;
        needle.style.transform = `rotate(${angles[idx]}deg)`;
        label.textContent = names[idx];
        playPopTone(420 + idx * 80, 'triangle', 0.06, 0.14);
        step++;
      }, 150);
      intervals.push(intv);

      const targetMap = { light: 0, heavy: 1, spicy: 2, sweet: 3 };
      const finalIdx = targetMap[currentDish.appetite] ?? 1;

      timers.push(setTimeout(() => {
        clearInterval(intv);
        needle.style.transform = `rotate(${angles[finalIdx]}deg)`;
        label.textContent = `النتيجة: ${names[finalIdx]} ✨`;
        playPopTone(880, 'sine', 0.25, 0.25);

        timers.push(setTimeout(() => {
          showFinalCard(`عدّاد الشهية اختار لك وجبة: ${names[finalIdx]}`, ['🧭', '✨', '⭐']);
        }, 550));
      }, 1450));
    }

    // =========================================================================
    // 17. المرآة السحرية / انعكاس القهوة والشاي (Coffee & Tea Ripples)
    // =========================================================================
    function initCoffeeMode(dish) {
      const icon = document.getElementById('coffeeReflectionIcon');
      window.putDishVisual(icon, dish, 84);
      icon.style.opacity = '0.3';
      icon.style.transform = 'scale(0.75)';
    }

    function runCoffeeMode() {
      if (document.getElementById('scene-coffee').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const icon = document.getElementById('coffeeReflectionIcon');
      playPopTone(587.33, 'sine', 0.4, 0.2);
      icon.style.opacity = '1';
      icon.style.transform = 'scale(1.45)';

      timers.push(setTimeout(() => {
        showFinalCard('اتضحت صورة الطبق في تموجات القهوة! ☕✨', ['☕', '✨', '🌟']);
      }, 850));
    }

    // =========================================================================
    // 18. تقطيع الشرائح بالسكين (Chef Knife Slice Fan)
    // =========================================================================
    function initKnifeMode() {
      document.querySelectorAll('.knife-slice').forEach(s => {
        s.style.transform = 'rotate(0deg) translateY(0)';
        s.style.opacity = '1';
      });
      const beam = document.getElementById('knifeBeam');
      beam.classList.add('hidden');
      beam.classList.remove('knife-slash-beam');
    }

    function runKnifeMode() {
      if (document.getElementById('scene-knife').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const beam = document.getElementById('knifeBeam');
      beam.classList.remove('hidden');
      beam.classList.add('knife-slash-beam');
      playKnifeSliceSound();

      timers.push(setTimeout(() => {
        const slices = document.querySelectorAll('.knife-slice');
        slices.forEach((s, idx) => {
          const deg = (idx - 2.5) * 18;
          s.style.transform = `rotate(${deg}deg) translateY(90px)`;
          s.style.opacity = '0';
        });

        timers.push(setTimeout(() => {
          showFinalCard('تقطيع احترافي! انفتحت الشرائح كالمروحة 🔪✨', ['🔪', '✨', '⭐']);
        }, 420));
      }, 280));
    }

    // =========================================================================
    // 19. موجة التوابل والزعفران (Saffron & Sumac Wave)
    // =========================================================================
    function initSpiceMode() {
      ['spiceWave1', 'spiceWave2', 'spiceWave3'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.add('hidden');
        el.classList.remove('spice-wave-layer');
      });
    }

    function runSpiceMode() {
      if (document.getElementById('scene-spice').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      ['spiceWave1', 'spiceWave2', 'spiceWave3'].forEach((id, idx) => {
        timers.push(setTimeout(() => {
          const el = document.getElementById(id);
          el.classList.remove('hidden');
          el.classList.add('spice-wave-layer');
          playNoiseBurst(900 + idx * 400, 0.35, 0.14);
        }, idx * 240));
      });

      timers.push(setTimeout(() => {
        showFinalCard('انزاحت موجات الزعفران والسماق عن الطبق! 🌊✨', ['🟡', '🔴', '✨']);
      }, 1250));
    }

    // =========================================================================
    // 20. رفع السفرة / الغطاء القماشي (Embroidered Cloth Lift)
    // =========================================================================
    function initClothMode() {
      const cloth = document.getElementById('embroideredCloth');
      cloth.classList.remove('cloth-lifted');
      cloth.style.opacity = '1';
    }

    function liftEmbroideredCloth() {
      if (document.getElementById('scene-cloth').classList.contains('hidden')) { setupStage(); return; }
      if (isBusy) return;
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      playNoiseBurst(1400, 0.4, 0.16);
      document.getElementById('embroideredCloth').classList.add('cloth-lifted');

      timers.push(setTimeout(() => {
        showFinalCard('رُفعت السفرة المطرّزة بأناقة! 🪡🍽️', ['🪡', '✨', '⭐']);
      }, 650));
    }

    // =========================================================================
    // 21. المفاجأة من تحت القبة / الفانوس (Lantern Glow Reveal)
    // =========================================================================
    function initLanternMode() {
      const halo = document.getElementById('lanternGlowHalo');
      halo.style.transform = 'scale(1)';
      halo.style.boxShadow = 'none';
    }

    function runLanternMode() {
      if (document.getElementById('scene-lantern').classList.contains('hidden')) { setupStage(); return; }
      isBusy = true;
      document.getElementById('revealBtn').disabled = true;

      const halo = document.getElementById('lanternGlowHalo');
      playPopTone(659.25, 'sine', 0.45, 0.22);
      halo.style.transform = 'scale(2.6)';
      halo.style.backgroundColor = 'rgba(253, 224, 71, 0.85)';
      halo.style.boxShadow = '0 0 80px 40px rgba(251, 191, 36, 0.9)';

      timers.push(setTimeout(() => {
        showFinalCard('أضاء الفانوس الشرقي نجمة المائدة! 🏮✨', ['🏮', '🌟', '✨']);
      }, 680));
    }

    // =========================================================================
    // مؤثرات الزينة والانفجار النجمي المشتركة
    // =========================================================================
    function showerGarnish(pool) {
      const layer = document.getElementById('garnishLayer');
      for (let i = 0; i < 16; i++) {
        const drop = document.createElement('div');
        drop.className = 'garnish-drop text-xl';
        drop.textContent = pool[i % pool.length];
        const sx = (Math.random() - 0.5) * 180;
        const ex = sx + (Math.random() - 0.5) * 45;
        const rot = (Math.random() - 0.5) * 320;
        drop.style.setProperty('--sx', `${sx}px`);
        drop.style.setProperty('--ex', `${ex}px`);
        drop.style.setProperty('--rot', `${rot}deg`);
        drop.style.animationDelay = `${Math.random() * 0.2}s`;
        layer.appendChild(drop);
        setTimeout(() => drop.remove(), 1450);
      }
    }

    function triggerBurst(icons) {
      const layer = document.getElementById('burstLayer');
      for (let i = 0; i < 18; i++) {
        const item = document.createElement('div');
        item.className = 'burst-item text-xl';
        item.textContent = icons[i % icons.length];
        const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.2;
        const dist = 80 + Math.random() * 70;
        item.style.left = '50%';
        item.style.top = '50%';
        item.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        item.style.setProperty('--ty', `${Math.sin(angle) * dist - 10}px`);
        item.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
        layer.appendChild(item);
        setTimeout(() => item.remove(), 980);
      }
    }

    // توجيه الزر الرئيسي للطريقة النشطة
    function handlePrimaryAction() {
      if (isBusy) return;
      const actions = {
        foil: () => autoWipeCanvas(true),
        fog: () => autoWipeCanvas(false),
        flame: runAutoFlame,
        flip: runFlipMode,
        mortar: runAutoMortar,
        taboon: runTaboonMode,
        basket: runBasketMode,
        capsule: runCapsuleMode,
        bubble: popGiantMagicBubble,
        ribbon: untieGiftRibbon,
        snap: runSnapMode,
        magnet: runMagnetMode,
        iris: runIrisMode,
        rising: runRisingBubblesMode,
        card3d: flip3DCardNow,
        gauge: runGaugeMode,
        coffee: runCoffeeMode,
        knife: runKnifeMode,
        spice: runSpiceMode,
        cloth: liftEmbroideredCloth,
        lantern: runLanternMode
      };
      if (actions[activeMode]) actions[activeMode]();
    }
