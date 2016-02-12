SC.initialize({
  client_id: 'ae7181a6bf9a2ea203fe24d06a5a5a32'
});

var reel1 = document.querySelector('#reel-1');
var reel2 = document.querySelector('#reel-2');
var tape1 = document.querySelector('#tape-1');
var tape2 = document.querySelector('#tape-2');
var emptyRate = 1.8;
var seekRate = 5;
var seekMs = seekRate * 100;

var reel = {
  keyframes: [{
    transform: 'rotate(0)'
  },{
    transform: 'rotate(-360deg)'
  }],
  options: {
    duration: 3000,
    iterations: Infinity,
    easing: 'linear',
    fill: 'both'
  }
};
var tape = {
  keyframes: [{
    transform: 'scale(1)'
  },{
    transform: 'scale(.4)'
  }],
  options: {
    duration: 30000,
    iterations: 1,
    easing: 'cubic-bezier(.47,.31,.89,1)',
    fill: 'both'
  }
};



document.getElementById('play').addEventListener('click', function(e) {
  var clist = e.currentTarget.classList;
  if (clist.contains('pressed')) {
    if (cassette.isRewinding || cassette.isForwarding) {
      cassette.trackPlayer.pause();
    } else {
      cassette.pause();
    }
    clist.remove('pressed');
  } else if (cassette.tapePlayer1.currentTime >= cassette.track.duration) {
    clist.add('pressed');
    setTimeout(function() {
      clist.remove('pressed');
    }, 200);
  } else {
    if (cassette.isRewinding || cassette.isForwarding) {
      cassette.trackPlayer.play();
    } else {
      cassette.resume();
    }
    clist.add('pressed');
  }
  // SC.resolve('https://soundcloud.com/san-fermin-1/no-devil-1').then(function(song) {
  //   tape.options.duration = song.duration;
  //   SC.stream('/tracks/' + song.id).then(function(player){
  //     player.play();
  //     startPlayerAnimation();
  //   });
  // });
  
  return false;
});

document.getElementById('rwd').addEventListener('click', function(e) {
  var clist = e.currentTarget.classList;
  clist[clist.contains('pressed') ? 'remove' : 'add']('pressed');
  
  if (clist.contains('pressed') && cassette.track) {
    if (cassette.isForwarding) {
      cassette.defastForwardAnimation();
      document.getElementById('fwd').classList.remove('pressed');
    }
    cassette.rewindAnimation();
    cassette.isRewinding = setInterval(function() {
      var time = cassette.trackPlayer.currentTime();
      if (time <= seekMs) {
        cassette.trackPlayer.seek(0);
        cassette.derewindAnimation(true);
        clist.remove('pressed');
      } else {
        cassette.trackPlayer.seek(time - seekMs);
      }
    }, 100);
  } else {
    cassette.derewindAnimation();
  }
});
document.getElementById('fwd').addEventListener('click', function(e) {
  var clist = e.currentTarget.classList;
  clist[clist.contains('pressed') ? 'remove' : 'add']('pressed');
  
  if (clist.contains('pressed') && cassette.track) {
    if (cassette.isRewinding) {
      cassette.derewindAnimation();
      document.getElementById('rwd').classList.remove('pressed');
    }
    cassette.fastForwardAnimation();
    cassette.isForwarding = setInterval(function() {
      var time = cassette.trackPlayer.currentTime();
      if (time >= cassette.track.duration - seekMs) {
        cassette.trackPlayer.seek(cassette.track.duration);
        cassette.defastForwardAnimation(true);
        clist.remove('pressed');
      } else {
        cassette.trackPlayer.seek(time + seekMs);
      }
    }, 100);
  } else {
    cassette.defastForwardAnimation();
  }
});

function search(e) {
  console.log('searching', document.getElementById('search').value);
  document.body.classList.remove('active');
  resetButtons();
  SC.get('/tracks', {
    q: document.getElementById('search').value,
    limit: 1
  }).then(function(tracks) {
    console.log(tracks.length);
    if (tracks.length) {
      cassette.track = tracks[0];
      tape.options.duration = cassette.track.duration;
      cassette.reelInterval = cassette.track.duration / 8;
      var uri = '/tracks/' + cassette.track.id;
      
      var footer = document.querySelector('footer');
      footer.querySelector('i:first-of-type').textContent = cassette.track.title || '';
      footer.querySelector('i:last-of-type').textContent = (cassette.track.user || {}).username || '';
      footer.querySelector('a').textContent = cassette.track.permalink_url;
      footer.querySelector('a').setAttribute('href', cassette.track.permalink_url);
      SC.stream(uri).then(function(player) {
  document.body.classList.add('active');
        cassette.trackPlayer = player;
        
        cassette.labelText = cassette.track.title;
        cassette.start();
      });
    }
  }, function(error, e2) {
    console.log('error ', error, e2);
  });
}

document.getElementById('searcher').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log('in submit');
  search(e);
  console.log('leaving submit');
  return false;
});

//document.body.classList.add('active');

var cassette = {
  playButton: document.getElementById('play'),
  counter: document.getElementById('counter'),
  pause: function() {
    this.reelPlayer1.pause();
    this.reelPlayer2.pause();
    this.tapePlayer1.pause();
    this.tapePlayer2.pause();
    this.trackPlayer.pause();
    this.counter.classList.add('paused');
  },
  start: function() {
    this.startAnimation();
    this.trackPlayer.play();
    this.counter.classList.add('playing');
    this.pause();
  },
  resume: function() {
    this.reelPlayer1.play();
    this.reelPlayer2.play();
    this.tapePlayer1.play();
    this.tapePlayer2.play();
    this.trackPlayer.play();
    this.counter.classList.add('playing'); this.counter.classList.remove('paused');
  },
  track: undefined,
  trackPlayer: undefined,
  startAnimation: function() {
    this.reelPlayer1 = reel1.animate(reel.keyframes, reel.options);
    this.reelPlayer2 = reel2.animate(reel.keyframes, reel.options);

    this.reelPlayer2.playbackRate = emptyRate;

    this.tapePlayer1 = tape1.animate(tape.keyframes, tape.options);
    this.tapePlayer2 = tape2.animate(tape.keyframes, tape.options);

    this.tapePlayer2.reverse();
    this.tapePlayer1.onfinish = function() {
      console.log('tapePlayer1 onfinish');
      cassette.reelPlayer1.pause();
      cassette.reelPlayer2.pause();
      cassette.reelPlayer1.playbackRate = 1;
      cassette.reelPlayer2.playbackRate = emptyRate;
      //cassette.reelPlayer1.pause();
      cassette.counter.classList.add('paused');
      cassette.playButton.classList.remove('pressed');
    }
  },
  set labelText(text) {
    var ele = document.getElementById('label-text')
    ele.textContent = text;
    if (text && text.length > 25) {
      ele.setAttribute('textLength', '830');
      ele.textContent = text.substring(0,23) + '...';
    } else {
      ele.removeAttribute('textLength');
    }
  },
  set reelInterval(interval) {
    console.log('setting interval', interval);
    this.counter.style.animationDuration = Math.floor(interval) + 'ms';
  },
  alterReelRate: function(e) {
    console.log('altering reel rate', this.isForwarding, this.isRewinding);
    if (!this.isForwarding && !this.isRewinding) {
      if (this.reelPlayer2.playbackRate > 1) {
        this.reelPlayer2.playbackRate = this.reelPlayer2.playbackRate - 0.1;
      }
      if (this.reelPlayer1.playbackRate < emptyRate) {
        this.reelPlayer1.playbackRate = this.reelPlayer1.playbackRate + 0.1;
      }
      console.log(this.reelPlayer1.playbackRate, this.reelPlayer2.playbackRate);
    }
  },
  updateReelRate: function() {
    console.log('updating reel rate');
    var percent = this.trackPlayer.currentTime() / this.track.duration;
    var range = emptyRate - 1;
    var rateDiff = percent * range;
    this.reelPlayer1.playbackRate = 1 + rateDiff;
    this.reelPlayer2.playbackRate = emptyRate - rateDiff;
    console.log(this.reelPlayer1.playbackRate, this.reelPlayer2.playbackRate);
  },
  fastForwardAnimation: function() {
    this.tapePlayer1.playbackRate = this.tapePlayer1.playbackRate * seekRate;
    this.tapePlayer2.playbackRate = this.tapePlayer2.playbackRate * seekRate;
    this.reelPlayer1.playbackRate = this.reelPlayer1.playbackRate * seekRate;
    this.reelPlayer2.playbackRate = this.reelPlayer2.playbackRate * seekRate;
    this.keepReelDirection();
  },
  defastForwardAnimation: function(atEnd) {
    clearInterval(this.isForwarding);
    this.isForwarding = false;
    this.tapePlayer1.playbackRate = this.tapePlayer1.playbackRate / seekRate;
    this.tapePlayer2.playbackRate = this.tapePlayer2.playbackRate / seekRate;
    this.reelPlayer1.playbackRate = this.reelPlayer1.playbackRate / seekRate;
    this.reelPlayer2.playbackRate = this.reelPlayer2.playbackRate / seekRate;
    if (!atEnd) {
      this.keepReelDirection(true);
    }
    this.updateReelRate();
  },
  rewindAnimation: function() {
    this.tapePlayer1.playbackRate = this.tapePlayer1.playbackRate * seekRate;
    this.tapePlayer2.playbackRate = this.tapePlayer2.playbackRate * seekRate;
    this.reelPlayer1.playbackRate = this.reelPlayer1.playbackRate * seekRate;
    this.reelPlayer2.playbackRate = this.reelPlayer2.playbackRate * seekRate;
    this.changeReelDirection();
  },
  derewindAnimation: function(atEnd) {
    clearInterval(this.isRewinding);
    this.isRewinding = false;
    this.tapePlayer1.playbackRate = this.tapePlayer1.playbackRate / seekRate;
    this.tapePlayer2.playbackRate = this.tapePlayer2.playbackRate / seekRate;
    this.reelPlayer1.playbackRate = this.reelPlayer1.playbackRate / seekRate;
    this.reelPlayer2.playbackRate = this.reelPlayer2.playbackRate / seekRate;
    this.changeReelDirection(true);
    this.updateReelRate();
  }, 
  changeReelDirection: function(checkPause) {
    this.tapePlayer1.reverse();
    this.tapePlayer2.reverse();
    this.reelPlayer1.reverse();
    this.reelPlayer2.reverse();
    if (checkPause && !this.playButton.classList.contains('pressed')) {
      this.tapePlayer1.pause();
      this.tapePlayer2.pause();
      this.reelPlayer1.pause();
      this.reelPlayer2.pause();
    }
  },
  keepReelDirection: function(checkPause) {
    this.tapePlayer1.play();
    this.tapePlayer2.play();
    this.reelPlayer1.play();
    this.reelPlayer2.play();
    if (checkPause && !this.playButton.classList.contains('pressed')) {
      this.tapePlayer1.pause();
      this.tapePlayer2.pause();
      this.reelPlayer1.pause();
      this.reelPlayer2.pause();
    }
  }
};

function resetButtons() {
  document.getElementById('play').classList.remove('pressed');
  document.getElementById('rwd').classList.remove('pressed');
  document.getElementById('fwd').classList.remove('pressed');
}

document.getElementById('counter').addEventListener('animationiteration', cassette.alterReelRate.bind(cassette));
document.getElementById('counter').addEventListener('webkitAnimationIteration', cassette.alterReelRate.bind(cassette));


document.getElementById('eject').addEventListener('click', function(e) {
  cassette.pause();
  if (cassette.isRewinding) {
    cassette.derewindAnimation();
  }
  if (cassette.isForwarding) {
    cassette.defastForwardAnimation();
  }
  var clist = e.currentTarget.classList;
  clist.add('pressed');
  console.log('ejecting');
  document.body.classList.remove('active');
  setTimeout(function() {
    clist.remove('pressed');
  }, 200);
});