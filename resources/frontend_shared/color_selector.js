var shared;
!(function () {
  var r = {
      168: function (r, n, t) {
        var e = t(92),
          a = {};
        for (var o in e) e.hasOwnProperty(o) && (a[e[o]] = o);
        var i = (r.exports = {
          rgb: { channels: 3, labels: "rgb" },
          hsl: { channels: 3, labels: "hsl" },
          hsv: { channels: 3, labels: "hsv" },
          hwb: { channels: 3, labels: "hwb" },
          cmyk: { channels: 4, labels: "cmyk" },
          xyz: { channels: 3, labels: "xyz" },
          lab: { channels: 3, labels: "lab" },
          lch: { channels: 3, labels: "lch" },
          hex: { channels: 1, labels: ["hex"] },
          keyword: { channels: 1, labels: ["keyword"] },
          ansi16: { channels: 1, labels: ["ansi16"] },
          ansi256: { channels: 1, labels: ["ansi256"] },
          hcg: { channels: 3, labels: ["h", "c", "g"] },
          apple: { channels: 3, labels: ["r16", "g16", "b16"] },
          gray: { channels: 1, labels: ["gray"] },
        });
        for (var u in i)
          if (i.hasOwnProperty(u)) {
            if (!("channels" in i[u]))
              throw new Error("missing channels property: " + u);
            if (!("labels" in i[u]))
              throw new Error("missing channel labels property: " + u);
            if (i[u].labels.length !== i[u].channels)
              throw new Error("channel and label counts mismatch: " + u);
            var l = i[u].channels,
              c = i[u].labels;
            delete i[u].channels,
              delete i[u].labels,
              Object.defineProperty(i[u], "channels", { value: l }),
              Object.defineProperty(i[u], "labels", { value: c });
          }
        (i.rgb.hsl = function (r) {
          var n,
            t,
            e = r[0] / 255,
            a = r[1] / 255,
            o = r[2] / 255,
            i = Math.min(e, a, o),
            u = Math.max(e, a, o),
            l = u - i;
          return (
            u === i
              ? (n = 0)
              : e === u
              ? (n = (a - o) / l)
              : a === u
              ? (n = 2 + (o - e) / l)
              : o === u && (n = 4 + (e - a) / l),
            (n = Math.min(60 * n, 360)) < 0 && (n += 360),
            (t = (i + u) / 2),
            [
              n,
              100 * (u === i ? 0 : t <= 0.5 ? l / (u + i) : l / (2 - u - i)),
              100 * t,
            ]
          );
        }),
          (i.rgb.hsv = function (r) {
            var n,
              t,
              e,
              a,
              o,
              i = r[0] / 255,
              u = r[1] / 255,
              l = r[2] / 255,
              c = Math.max(i, u, l),
              s = c - Math.min(i, u, l),
              h = function (r) {
                return (c - r) / 6 / s + 0.5;
              };
            return (
              0 === s
                ? (a = o = 0)
                : ((o = s / c),
                  (n = h(i)),
                  (t = h(u)),
                  (e = h(l)),
                  i === c
                    ? (a = e - t)
                    : u === c
                    ? (a = 1 / 3 + n - e)
                    : l === c && (a = 2 / 3 + t - n),
                  a < 0 ? (a += 1) : a > 1 && (a -= 1)),
              [360 * a, 100 * o, 100 * c]
            );
          }),
          (i.rgb.hwb = function (r) {
            var n = r[0],
              t = r[1],
              e = r[2];
            return [
              i.rgb.hsl(r)[0],
              (1 / 255) * Math.min(n, Math.min(t, e)) * 100,
              100 * (e = 1 - (1 / 255) * Math.max(n, Math.max(t, e))),
            ];
          }),
          (i.rgb.cmyk = function (r) {
            var n,
              t = r[0] / 255,
              e = r[1] / 255,
              a = r[2] / 255;
            return [
              100 *
                ((1 - t - (n = Math.min(1 - t, 1 - e, 1 - a))) / (1 - n) || 0),
              100 * ((1 - e - n) / (1 - n) || 0),
              100 * ((1 - a - n) / (1 - n) || 0),
              100 * n,
            ];
          }),
          (i.rgb.keyword = function (r) {
            var n = a[r];
            if (n) return n;
            var t,
              o,
              i,
              u = 1 / 0;
            for (var l in e)
              if (e.hasOwnProperty(l)) {
                var c =
                  ((o = r),
                  (i = e[l]),
                  Math.pow(o[0] - i[0], 2) +
                    Math.pow(o[1] - i[1], 2) +
                    Math.pow(o[2] - i[2], 2));
                c < u && ((u = c), (t = l));
              }
            return t;
          }),
          (i.keyword.rgb = function (r) {
            return e[r];
          }),
          (i.rgb.xyz = function (r) {
            var n = r[0] / 255,
              t = r[1] / 255,
              e = r[2] / 255;
            return [
              100 *
                (0.4124 *
                  (n =
                    n > 0.04045
                      ? Math.pow((n + 0.055) / 1.055, 2.4)
                      : n / 12.92) +
                  0.3576 *
                    (t =
                      t > 0.04045
                        ? Math.pow((t + 0.055) / 1.055, 2.4)
                        : t / 12.92) +
                  0.1805 *
                    (e =
                      e > 0.04045
                        ? Math.pow((e + 0.055) / 1.055, 2.4)
                        : e / 12.92)),
              100 * (0.2126 * n + 0.7152 * t + 0.0722 * e),
              100 * (0.0193 * n + 0.1192 * t + 0.9505 * e),
            ];
          }),
          (i.rgb.lab = function (r) {
            var n = i.rgb.xyz(r),
              t = n[0],
              e = n[1],
              a = n[2];
            return (
              (e /= 100),
              (a /= 108.883),
              (t =
                (t /= 95.047) > 0.008856
                  ? Math.pow(t, 1 / 3)
                  : 7.787 * t + 16 / 116),
              [
                116 *
                  (e =
                    e > 0.008856 ? Math.pow(e, 1 / 3) : 7.787 * e + 16 / 116) -
                  16,
                500 * (t - e),
                200 *
                  (e -
                    (a =
                      a > 0.008856
                        ? Math.pow(a, 1 / 3)
                        : 7.787 * a + 16 / 116)),
              ]
            );
          }),
          (i.hsl.rgb = function (r) {
            var n,
              t,
              e,
              a,
              o,
              i = r[0] / 360,
              u = r[1] / 100,
              l = r[2] / 100;
            if (0 === u) return [(o = 255 * l), o, o];
            (n = 2 * l - (t = l < 0.5 ? l * (1 + u) : l + u - l * u)),
              (a = [0, 0, 0]);
            for (var c = 0; c < 3; c++)
              (e = i + (1 / 3) * -(c - 1)) < 0 && e++,
                e > 1 && e--,
                (o =
                  6 * e < 1
                    ? n + 6 * (t - n) * e
                    : 2 * e < 1
                    ? t
                    : 3 * e < 2
                    ? n + (t - n) * (2 / 3 - e) * 6
                    : n),
                (a[c] = 255 * o);
            return a;
          }),
          (i.hsl.hsv = function (r) {
            var n = r[0],
              t = r[1] / 100,
              e = r[2] / 100,
              a = t,
              o = Math.max(e, 0.01);
            return (
              (t *= (e *= 2) <= 1 ? e : 2 - e),
              (a *= o <= 1 ? o : 2 - o),
              [
                n,
                100 * (0 === e ? (2 * a) / (o + a) : (2 * t) / (e + t)),
                ((e + t) / 2) * 100,
              ]
            );
          }),
          (i.hsv.rgb = function (r) {
            var n = r[0] / 60,
              t = r[1] / 100,
              e = r[2] / 100,
              a = Math.floor(n) % 6,
              o = n - Math.floor(n),
              i = 255 * e * (1 - t),
              u = 255 * e * (1 - t * o),
              l = 255 * e * (1 - t * (1 - o));
            switch (((e *= 255), a)) {
              case 0:
                return [e, l, i];
              case 1:
                return [u, e, i];
              case 2:
                return [i, e, l];
              case 3:
                return [i, u, e];
              case 4:
                return [l, i, e];
              case 5:
                return [e, i, u];
            }
          }),
          (i.hsv.hsl = function (r) {
            var n,
              t,
              e,
              a = r[0],
              o = r[1] / 100,
              i = r[2] / 100,
              u = Math.max(i, 0.01);
            return (
              (e = (2 - o) * i),
              (t = o * u),
              [
                a,
                100 * (t = (t /= (n = (2 - o) * u) <= 1 ? n : 2 - n) || 0),
                100 * (e /= 2),
              ]
            );
          }),
          (i.hwb.rgb = function (r) {
            var n,
              t,
              e,
              a,
              o,
              i,
              u,
              l = r[0] / 360,
              c = r[1] / 100,
              s = r[2] / 100,
              h = c + s;
            switch (
              (h > 1 && ((c /= h), (s /= h)),
              (e = 6 * l - (n = Math.floor(6 * l))),
              0 != (1 & n) && (e = 1 - e),
              (a = c + e * ((t = 1 - s) - c)),
              n)
            ) {
              default:
                (o = t), (i = a), (u = c);
                break;
              case 1:
                (o = a), (i = t), (u = c);
                break;
              case 2:
                (o = c), (i = t), (u = a);
                break;
              case 3:
                (o = c), (i = a), (u = t);
                break;
              case 4:
                (o = a), (i = c), (u = t);
                break;
              case 5:
                (o = t), (i = c), (u = a);
            }
            return [255 * o, 255 * i, 255 * u];
          }),
          (i.cmyk.rgb = function (r) {
            var n = r[0] / 100,
              t = r[1] / 100,
              e = r[2] / 100,
              a = r[3] / 100;
            return [
              255 * (1 - Math.min(1, n * (1 - a) + a)),
              255 * (1 - Math.min(1, t * (1 - a) + a)),
              255 * (1 - Math.min(1, e * (1 - a) + a)),
            ];
          }),
          (i.xyz.rgb = function (r) {
            var n,
              t,
              e,
              a = r[0] / 100,
              o = r[1] / 100,
              i = r[2] / 100;
            return (
              (t = -0.9689 * a + 1.8758 * o + 0.0415 * i),
              (e = 0.0557 * a + -0.204 * o + 1.057 * i),
              (n =
                (n = 3.2406 * a + -1.5372 * o + -0.4986 * i) > 0.0031308
                  ? 1.055 * Math.pow(n, 1 / 2.4) - 0.055
                  : 12.92 * n),
              (t =
                t > 0.0031308
                  ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055
                  : 12.92 * t),
              (e =
                e > 0.0031308
                  ? 1.055 * Math.pow(e, 1 / 2.4) - 0.055
                  : 12.92 * e),
              [
                255 * (n = Math.min(Math.max(0, n), 1)),
                255 * (t = Math.min(Math.max(0, t), 1)),
                255 * (e = Math.min(Math.max(0, e), 1)),
              ]
            );
          }),
          (i.xyz.lab = function (r) {
            var n = r[0],
              t = r[1],
              e = r[2];
            return (
              (t /= 100),
              (e /= 108.883),
              (n =
                (n /= 95.047) > 0.008856
                  ? Math.pow(n, 1 / 3)
                  : 7.787 * n + 16 / 116),
              [
                116 *
                  (t =
                    t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116) -
                  16,
                500 * (n - t),
                200 *
                  (t -
                    (e =
                      e > 0.008856
                        ? Math.pow(e, 1 / 3)
                        : 7.787 * e + 16 / 116)),
              ]
            );
          }),
          (i.lab.xyz = function (r) {
            var n,
              t,
              e,
              a = r[0];
            (n = r[1] / 500 + (t = (a + 16) / 116)), (e = t - r[2] / 200);
            var o = Math.pow(t, 3),
              i = Math.pow(n, 3),
              u = Math.pow(e, 3);
            return (
              (t = o > 0.008856 ? o : (t - 16 / 116) / 7.787),
              (n = i > 0.008856 ? i : (n - 16 / 116) / 7.787),
              (e = u > 0.008856 ? u : (e - 16 / 116) / 7.787),
              [(n *= 95.047), (t *= 100), (e *= 108.883)]
            );
          }),
          (i.lab.lch = function (r) {
            var n,
              t = r[0],
              e = r[1],
              a = r[2];
            return (
              (n = (360 * Math.atan2(a, e)) / 2 / Math.PI) < 0 && (n += 360),
              [t, Math.sqrt(e * e + a * a), n]
            );
          }),
          (i.lch.lab = function (r) {
            var n,
              t = r[0],
              e = r[1];
            return (
              (n = (r[2] / 360) * 2 * Math.PI),
              [t, e * Math.cos(n), e * Math.sin(n)]
            );
          }),
          (i.rgb.ansi16 = function (r) {
            var n = r[0],
              t = r[1],
              e = r[2],
              a = 1 in arguments ? arguments[1] : i.rgb.hsv(r)[2];
            if (0 === (a = Math.round(a / 50))) return 30;
            var o =
              30 +
              ((Math.round(e / 255) << 2) |
                (Math.round(t / 255) << 1) |
                Math.round(n / 255));
            return 2 === a && (o += 60), o;
          }),
          (i.hsv.ansi16 = function (r) {
            return i.rgb.ansi16(i.hsv.rgb(r), r[2]);
          }),
          (i.rgb.ansi256 = function (r) {
            var n = r[0],
              t = r[1],
              e = r[2];
            return n === t && t === e
              ? n < 8
                ? 16
                : n > 248
                ? 231
                : Math.round(((n - 8) / 247) * 24) + 232
              : 16 +
                  36 * Math.round((n / 255) * 5) +
                  6 * Math.round((t / 255) * 5) +
                  Math.round((e / 255) * 5);
          }),
          (i.ansi16.rgb = function (r) {
            var n = r % 10;
            if (0 === n || 7 === n)
              return r > 50 && (n += 3.5), [(n = (n / 10.5) * 255), n, n];
            var t = 0.5 * (1 + ~~(r > 50));
            return [
              (1 & n) * t * 255,
              ((n >> 1) & 1) * t * 255,
              ((n >> 2) & 1) * t * 255,
            ];
          }),
          (i.ansi256.rgb = function (r) {
            if (r >= 232) {
              var n = 10 * (r - 232) + 8;
              return [n, n, n];
            }
            var t;
            return (
              (r -= 16),
              [
                (Math.floor(r / 36) / 5) * 255,
                (Math.floor((t = r % 36) / 6) / 5) * 255,
                ((t % 6) / 5) * 255,
              ]
            );
          }),
          (i.rgb.hex = function (r) {
            var n = (
              ((255 & Math.round(r[0])) << 16) +
              ((255 & Math.round(r[1])) << 8) +
              (255 & Math.round(r[2]))
            )
              .toString(16)
              .toUpperCase();
            return "000000".substring(n.length) + n;
          }),
          (i.hex.rgb = function (r) {
            var n = r.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
            if (!n) return [0, 0, 0];
            var t = n[0];
            3 === n[0].length &&
              (t = t
                .split("")
                .map(function (r) {
                  return r + r;
                })
                .join(""));
            var e = parseInt(t, 16);
            return [(e >> 16) & 255, (e >> 8) & 255, 255 & e];
          }),
          (i.rgb.hcg = function (r) {
            var n,
              t = r[0] / 255,
              e = r[1] / 255,
              a = r[2] / 255,
              o = Math.max(Math.max(t, e), a),
              i = Math.min(Math.min(t, e), a),
              u = o - i;
            return (
              (n =
                u <= 0
                  ? 0
                  : o === t
                  ? ((e - a) / u) % 6
                  : o === e
                  ? 2 + (a - t) / u
                  : 4 + (t - e) / u + 4),
              (n /= 6),
              [360 * (n %= 1), 100 * u, 100 * (u < 1 ? i / (1 - u) : 0)]
            );
          }),
          (i.hsl.hcg = function (r) {
            var n,
              t = r[1] / 100,
              e = r[2] / 100,
              a = 0;
            return (
              (n = e < 0.5 ? 2 * t * e : 2 * t * (1 - e)) < 1 &&
                (a = (e - 0.5 * n) / (1 - n)),
              [r[0], 100 * n, 100 * a]
            );
          }),
          (i.hsv.hcg = function (r) {
            var n = r[1] / 100,
              t = r[2] / 100,
              e = n * t,
              a = 0;
            return e < 1 && (a = (t - e) / (1 - e)), [r[0], 100 * e, 100 * a];
          }),
          (i.hcg.rgb = function (r) {
            var n = r[0] / 360,
              t = r[1] / 100,
              e = r[2] / 100;
            if (0 === t) return [255 * e, 255 * e, 255 * e];
            var a,
              o = [0, 0, 0],
              i = (n % 1) * 6,
              u = i % 1,
              l = 1 - u;
            switch (Math.floor(i)) {
              case 0:
                (o[0] = 1), (o[1] = u), (o[2] = 0);
                break;
              case 1:
                (o[0] = l), (o[1] = 1), (o[2] = 0);
                break;
              case 2:
                (o[0] = 0), (o[1] = 1), (o[2] = u);
                break;
              case 3:
                (o[0] = 0), (o[1] = l), (o[2] = 1);
                break;
              case 4:
                (o[0] = u), (o[1] = 0), (o[2] = 1);
                break;
              default:
                (o[0] = 1), (o[1] = 0), (o[2] = l);
            }
            return (
              (a = (1 - t) * e),
              [255 * (t * o[0] + a), 255 * (t * o[1] + a), 255 * (t * o[2] + a)]
            );
          }),
          (i.hcg.hsv = function (r) {
            var n = r[1] / 100,
              t = n + (r[2] / 100) * (1 - n),
              e = 0;
            return t > 0 && (e = n / t), [r[0], 100 * e, 100 * t];
          }),
          (i.hcg.hsl = function (r) {
            var n = r[1] / 100,
              t = (r[2] / 100) * (1 - n) + 0.5 * n,
              e = 0;
            return (
              t > 0 && t < 0.5
                ? (e = n / (2 * t))
                : t >= 0.5 && t < 1 && (e = n / (2 * (1 - t))),
              [r[0], 100 * e, 100 * t]
            );
          }),
          (i.hcg.hwb = function (r) {
            var n = r[1] / 100,
              t = n + (r[2] / 100) * (1 - n);
            return [r[0], 100 * (t - n), 100 * (1 - t)];
          }),
          (i.hwb.hcg = function (r) {
            var n = r[1] / 100,
              t = 1 - r[2] / 100,
              e = t - n,
              a = 0;
            return e < 1 && (a = (t - e) / (1 - e)), [r[0], 100 * e, 100 * a];
          }),
          (i.apple.rgb = function (r) {
            return [
              (r[0] / 65535) * 255,
              (r[1] / 65535) * 255,
              (r[2] / 65535) * 255,
            ];
          }),
          (i.rgb.apple = function (r) {
            return [
              (r[0] / 255) * 65535,
              (r[1] / 255) * 65535,
              (r[2] / 255) * 65535,
            ];
          }),
          (i.gray.rgb = function (r) {
            return [(r[0] / 100) * 255, (r[0] / 100) * 255, (r[0] / 100) * 255];
          }),
          (i.gray.hsl = i.gray.hsv =
            function (r) {
              return [0, 0, r[0]];
            }),
          (i.gray.hwb = function (r) {
            return [0, 100, r[0]];
          }),
          (i.gray.cmyk = function (r) {
            return [0, 0, 0, r[0]];
          }),
          (i.gray.lab = function (r) {
            return [r[0], 0, 0];
          }),
          (i.gray.hex = function (r) {
            var n = 255 & Math.round((r[0] / 100) * 255),
              t = ((n << 16) + (n << 8) + n).toString(16).toUpperCase();
            return "000000".substring(t.length) + t;
          }),
          (i.rgb.gray = function (r) {
            return [((r[0] + r[1] + r[2]) / 3 / 255) * 100];
          });
      },
      85: function (r, n, t) {
        var e = t(168),
          a = t(111),
          o = {};
        Object.keys(e).forEach(function (r) {
          (o[r] = {}),
            Object.defineProperty(o[r], "channels", { value: e[r].channels }),
            Object.defineProperty(o[r], "labels", { value: e[r].labels });
          var n = a(r);
          Object.keys(n).forEach(function (t) {
            var e = n[t];
            (o[r][t] = (function (r) {
              var n = function (n) {
                if (null == n) return n;
                arguments.length > 1 &&
                  (n = Array.prototype.slice.call(arguments));
                var t = r(n);
                if ("object" == typeof t)
                  for (var e = t.length, a = 0; a < e; a++)
                    t[a] = Math.round(t[a]);
                return t;
              };
              return "conversion" in r && (n.conversion = r.conversion), n;
            })(e)),
              (o[r][t].raw = (function (r) {
                var n = function (n) {
                  return null == n
                    ? n
                    : (arguments.length > 1 &&
                        (n = Array.prototype.slice.call(arguments)),
                      r(n));
                };
                return "conversion" in r && (n.conversion = r.conversion), n;
              })(e));
          });
        }),
          (r.exports = o);
      },
      92: function (r) {
        "use strict";
        r.exports = {
          aliceblue: [240, 248, 255],
          antiquewhite: [250, 235, 215],
          aqua: [0, 255, 255],
          aquamarine: [127, 255, 212],
          azure: [240, 255, 255],
          beige: [245, 245, 220],
          bisque: [255, 228, 196],
          black: [0, 0, 0],
          blanchedalmond: [255, 235, 205],
          blue: [0, 0, 255],
          blueviolet: [138, 43, 226],
          brown: [165, 42, 42],
          burlywood: [222, 184, 135],
          cadetblue: [95, 158, 160],
          chartreuse: [127, 255, 0],
          chocolate: [210, 105, 30],
          coral: [255, 127, 80],
          cornflowerblue: [100, 149, 237],
          cornsilk: [255, 248, 220],
          crimson: [220, 20, 60],
          cyan: [0, 255, 255],
          darkblue: [0, 0, 139],
          darkcyan: [0, 139, 139],
          darkgoldenrod: [184, 134, 11],
          darkgray: [169, 169, 169],
          darkgreen: [0, 100, 0],
          darkgrey: [169, 169, 169],
          darkkhaki: [189, 183, 107],
          darkmagenta: [139, 0, 139],
          darkolivegreen: [85, 107, 47],
          darkorange: [255, 140, 0],
          darkorchid: [153, 50, 204],
          darkred: [139, 0, 0],
          darksalmon: [233, 150, 122],
          darkseagreen: [143, 188, 143],
          darkslateblue: [72, 61, 139],
          darkslategray: [47, 79, 79],
          darkslategrey: [47, 79, 79],
          darkturquoise: [0, 206, 209],
          darkviolet: [148, 0, 211],
          deeppink: [255, 20, 147],
          deepskyblue: [0, 191, 255],
          dimgray: [105, 105, 105],
          dimgrey: [105, 105, 105],
          dodgerblue: [30, 144, 255],
          firebrick: [178, 34, 34],
          floralwhite: [255, 250, 240],
          forestgreen: [34, 139, 34],
          fuchsia: [255, 0, 255],
          gainsboro: [220, 220, 220],
          ghostwhite: [248, 248, 255],
          gold: [255, 215, 0],
          goldenrod: [218, 165, 32],
          gray: [128, 128, 128],
          green: [0, 128, 0],
          greenyellow: [173, 255, 47],
          grey: [128, 128, 128],
          honeydew: [240, 255, 240],
          hotpink: [255, 105, 180],
          indianred: [205, 92, 92],
          indigo: [75, 0, 130],
          ivory: [255, 255, 240],
          khaki: [240, 230, 140],
          lavender: [230, 230, 250],
          lavenderblush: [255, 240, 245],
          lawngreen: [124, 252, 0],
          lemonchiffon: [255, 250, 205],
          lightblue: [173, 216, 230],
          lightcoral: [240, 128, 128],
          lightcyan: [224, 255, 255],
          lightgoldenrodyellow: [250, 250, 210],
          lightgray: [211, 211, 211],
          lightgreen: [144, 238, 144],
          lightgrey: [211, 211, 211],
          lightpink: [255, 182, 193],
          lightsalmon: [255, 160, 122],
          lightseagreen: [32, 178, 170],
          lightskyblue: [135, 206, 250],
          lightslategray: [119, 136, 153],
          lightslategrey: [119, 136, 153],
          lightsteelblue: [176, 196, 222],
          lightyellow: [255, 255, 224],
          lime: [0, 255, 0],
          limegreen: [50, 205, 50],
          linen: [250, 240, 230],
          magenta: [255, 0, 255],
          maroon: [128, 0, 0],
          mediumaquamarine: [102, 205, 170],
          mediumblue: [0, 0, 205],
          mediumorchid: [186, 85, 211],
          mediumpurple: [147, 112, 219],
          mediumseagreen: [60, 179, 113],
          mediumslateblue: [123, 104, 238],
          mediumspringgreen: [0, 250, 154],
          mediumturquoise: [72, 209, 204],
          mediumvioletred: [199, 21, 133],
          midnightblue: [25, 25, 112],
          mintcream: [245, 255, 250],
          mistyrose: [255, 228, 225],
          moccasin: [255, 228, 181],
          navajowhite: [255, 222, 173],
          navy: [0, 0, 128],
          oldlace: [253, 245, 230],
          olive: [128, 128, 0],
          olivedrab: [107, 142, 35],
          orange: [255, 165, 0],
          orangered: [255, 69, 0],
          orchid: [218, 112, 214],
          palegoldenrod: [238, 232, 170],
          palegreen: [152, 251, 152],
          paleturquoise: [175, 238, 238],
          palevioletred: [219, 112, 147],
          papayawhip: [255, 239, 213],
          peachpuff: [255, 218, 185],
          peru: [205, 133, 63],
          pink: [255, 192, 203],
          plum: [221, 160, 221],
          powderblue: [176, 224, 230],
          purple: [128, 0, 128],
          rebeccapurple: [102, 51, 153],
          red: [255, 0, 0],
          rosybrown: [188, 143, 143],
          royalblue: [65, 105, 225],
          saddlebrown: [139, 69, 19],
          salmon: [250, 128, 114],
          sandybrown: [244, 164, 96],
          seagreen: [46, 139, 87],
          seashell: [255, 245, 238],
          sienna: [160, 82, 45],
          silver: [192, 192, 192],
          skyblue: [135, 206, 235],
          slateblue: [106, 90, 205],
          slategray: [112, 128, 144],
          slategrey: [112, 128, 144],
          snow: [255, 250, 250],
          springgreen: [0, 255, 127],
          steelblue: [70, 130, 180],
          tan: [210, 180, 140],
          teal: [0, 128, 128],
          thistle: [216, 191, 216],
          tomato: [255, 99, 71],
          turquoise: [64, 224, 208],
          violet: [238, 130, 238],
          wheat: [245, 222, 179],
          white: [255, 255, 255],
          whitesmoke: [245, 245, 245],
          yellow: [255, 255, 0],
          yellowgreen: [154, 205, 50],
        };
      },
      111: function (r, n, t) {
        var e = t(168);
        function a(r, n) {
          return function (t) {
            return n(r(t));
          };
        }
        function o(r, n) {
          for (
            var t = [n[r].parent, r], o = e[n[r].parent][r], i = n[r].parent;
            n[i].parent;

          )
            t.unshift(n[i].parent),
              (o = a(e[n[i].parent][i], o)),
              (i = n[i].parent);
          return (o.conversion = t), o;
        }
        r.exports = function (r) {
          for (
            var n = (function (r) {
                var n = (function () {
                    for (
                      var r = {}, n = Object.keys(e), t = n.length, a = 0;
                      a < t;
                      a++
                    )
                      r[n[a]] = { distance: -1, parent: null };
                    return r;
                  })(),
                  t = [r];
                for (n[r].distance = 0; t.length; )
                  for (
                    var a = t.pop(), o = Object.keys(e[a]), i = o.length, u = 0;
                    u < i;
                    u++
                  ) {
                    var l = o[u],
                      c = n[l];
                    -1 === c.distance &&
                      ((c.distance = n[a].distance + 1),
                      (c.parent = a),
                      t.unshift(l));
                  }
                return n;
              })(r),
              t = {},
              a = Object.keys(n),
              i = a.length,
              u = 0;
            u < i;
            u++
          ) {
            var l = a[u];
            null !== n[l].parent && (t[l] = o(l, n));
          }
          return t;
        };
      },
      874: function (r) {
        "use strict";
        r.exports = {
          aliceblue: [240, 248, 255],
          antiquewhite: [250, 235, 215],
          aqua: [0, 255, 255],
          aquamarine: [127, 255, 212],
          azure: [240, 255, 255],
          beige: [245, 245, 220],
          bisque: [255, 228, 196],
          black: [0, 0, 0],
          blanchedalmond: [255, 235, 205],
          blue: [0, 0, 255],
          blueviolet: [138, 43, 226],
          brown: [165, 42, 42],
          burlywood: [222, 184, 135],
          cadetblue: [95, 158, 160],
          chartreuse: [127, 255, 0],
          chocolate: [210, 105, 30],
          coral: [255, 127, 80],
          cornflowerblue: [100, 149, 237],
          cornsilk: [255, 248, 220],
          crimson: [220, 20, 60],
          cyan: [0, 255, 255],
          darkblue: [0, 0, 139],
          darkcyan: [0, 139, 139],
          darkgoldenrod: [184, 134, 11],
          darkgray: [169, 169, 169],
          darkgreen: [0, 100, 0],
          darkgrey: [169, 169, 169],
          darkkhaki: [189, 183, 107],
          darkmagenta: [139, 0, 139],
          darkolivegreen: [85, 107, 47],
          darkorange: [255, 140, 0],
          darkorchid: [153, 50, 204],
          darkred: [139, 0, 0],
          darksalmon: [233, 150, 122],
          darkseagreen: [143, 188, 143],
          darkslateblue: [72, 61, 139],
          darkslategray: [47, 79, 79],
          darkslategrey: [47, 79, 79],
          darkturquoise: [0, 206, 209],
          darkviolet: [148, 0, 211],
          deeppink: [255, 20, 147],
          deepskyblue: [0, 191, 255],
          dimgray: [105, 105, 105],
          dimgrey: [105, 105, 105],
          dodgerblue: [30, 144, 255],
          firebrick: [178, 34, 34],
          floralwhite: [255, 250, 240],
          forestgreen: [34, 139, 34],
          fuchsia: [255, 0, 255],
          gainsboro: [220, 220, 220],
          ghostwhite: [248, 248, 255],
          gold: [255, 215, 0],
          goldenrod: [218, 165, 32],
          gray: [128, 128, 128],
          green: [0, 128, 0],
          greenyellow: [173, 255, 47],
          grey: [128, 128, 128],
          honeydew: [240, 255, 240],
          hotpink: [255, 105, 180],
          indianred: [205, 92, 92],
          indigo: [75, 0, 130],
          ivory: [255, 255, 240],
          khaki: [240, 230, 140],
          lavender: [230, 230, 250],
          lavenderblush: [255, 240, 245],
          lawngreen: [124, 252, 0],
          lemonchiffon: [255, 250, 205],
          lightblue: [173, 216, 230],
          lightcoral: [240, 128, 128],
          lightcyan: [224, 255, 255],
          lightgoldenrodyellow: [250, 250, 210],
          lightgray: [211, 211, 211],
          lightgreen: [144, 238, 144],
          lightgrey: [211, 211, 211],
          lightpink: [255, 182, 193],
          lightsalmon: [255, 160, 122],
          lightseagreen: [32, 178, 170],
          lightskyblue: [135, 206, 250],
          lightslategray: [119, 136, 153],
          lightslategrey: [119, 136, 153],
          lightsteelblue: [176, 196, 222],
          lightyellow: [255, 255, 224],
          lime: [0, 255, 0],
          limegreen: [50, 205, 50],
          linen: [250, 240, 230],
          magenta: [255, 0, 255],
          maroon: [128, 0, 0],
          mediumaquamarine: [102, 205, 170],
          mediumblue: [0, 0, 205],
          mediumorchid: [186, 85, 211],
          mediumpurple: [147, 112, 219],
          mediumseagreen: [60, 179, 113],
          mediumslateblue: [123, 104, 238],
          mediumspringgreen: [0, 250, 154],
          mediumturquoise: [72, 209, 204],
          mediumvioletred: [199, 21, 133],
          midnightblue: [25, 25, 112],
          mintcream: [245, 255, 250],
          mistyrose: [255, 228, 225],
          moccasin: [255, 228, 181],
          navajowhite: [255, 222, 173],
          navy: [0, 0, 128],
          oldlace: [253, 245, 230],
          olive: [128, 128, 0],
          olivedrab: [107, 142, 35],
          orange: [255, 165, 0],
          orangered: [255, 69, 0],
          orchid: [218, 112, 214],
          palegoldenrod: [238, 232, 170],
          palegreen: [152, 251, 152],
          paleturquoise: [175, 238, 238],
          palevioletred: [219, 112, 147],
          papayawhip: [255, 239, 213],
          peachpuff: [255, 218, 185],
          peru: [205, 133, 63],
          pink: [255, 192, 203],
          plum: [221, 160, 221],
          powderblue: [176, 224, 230],
          purple: [128, 0, 128],
          rebeccapurple: [102, 51, 153],
          red: [255, 0, 0],
          rosybrown: [188, 143, 143],
          royalblue: [65, 105, 225],
          saddlebrown: [139, 69, 19],
          salmon: [250, 128, 114],
          sandybrown: [244, 164, 96],
          seagreen: [46, 139, 87],
          seashell: [255, 245, 238],
          sienna: [160, 82, 45],
          silver: [192, 192, 192],
          skyblue: [135, 206, 235],
          slateblue: [106, 90, 205],
          slategray: [112, 128, 144],
          slategrey: [112, 128, 144],
          snow: [255, 250, 250],
          springgreen: [0, 255, 127],
          steelblue: [70, 130, 180],
          tan: [210, 180, 140],
          teal: [0, 128, 128],
          thistle: [216, 191, 216],
          tomato: [255, 99, 71],
          turquoise: [64, 224, 208],
          violet: [238, 130, 238],
          wheat: [245, 222, 179],
          white: [255, 255, 255],
          whitesmoke: [245, 245, 245],
          yellow: [255, 255, 0],
          yellowgreen: [154, 205, 50],
        };
      },
      818: function (r, n, t) {
        var e = t(874),
          a = t(851),
          o = {};
        for (var i in e) e.hasOwnProperty(i) && (o[e[i]] = i);
        var u = (r.exports = { to: {}, get: {} });
        function l(r, n, t) {
          return Math.min(Math.max(n, r), t);
        }
        function c(r) {
          var n = r.toString(16).toUpperCase();
          return n.length < 2 ? "0" + n : n;
        }
        (u.get = function (r) {
          var n, t;
          switch (r.substring(0, 3).toLowerCase()) {
            case "hsl":
              (n = u.get.hsl(r)), (t = "hsl");
              break;
            case "hwb":
              (n = u.get.hwb(r)), (t = "hwb");
              break;
            default:
              (n = u.get.rgb(r)), (t = "rgb");
          }
          return n ? { model: t, value: n } : null;
        }),
          (u.get.rgb = function (r) {
            if (!r) return null;
            var n,
              t,
              a,
              o = [0, 0, 0, 1];
            if ((n = r.match(/^#([a-f0-9]{6})([a-f0-9]{2})?$/i))) {
              for (a = n[2], n = n[1], t = 0; t < 3; t++) {
                var i = 2 * t;
                o[t] = parseInt(n.slice(i, i + 2), 16);
              }
              a && (o[3] = parseInt(a, 16) / 255);
            } else if ((n = r.match(/^#([a-f0-9]{3,4})$/i))) {
              for (a = (n = n[1])[3], t = 0; t < 3; t++)
                o[t] = parseInt(n[t] + n[t], 16);
              a && (o[3] = parseInt(a + a, 16) / 255);
            } else if (
              (n = r.match(
                /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
              ))
            ) {
              for (t = 0; t < 3; t++) o[t] = parseInt(n[t + 1], 0);
              n[4] && (o[3] = parseFloat(n[4]));
            } else {
              if (
                !(n = r.match(
                  /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
                ))
              )
                return (n = r.match(/(\D+)/))
                  ? "transparent" === n[1]
                    ? [0, 0, 0, 0]
                    : (o = e[n[1]])
                    ? ((o[3] = 1), o)
                    : null
                  : null;
              for (t = 0; t < 3; t++)
                o[t] = Math.round(2.55 * parseFloat(n[t + 1]));
              n[4] && (o[3] = parseFloat(n[4]));
            }
            for (t = 0; t < 3; t++) o[t] = l(o[t], 0, 255);
            return (o[3] = l(o[3], 0, 1)), o;
          }),
          (u.get.hsl = function (r) {
            if (!r) return null;
            var n = r.match(
              /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
            );
            if (n) {
              var t = parseFloat(n[4]);
              return [
                (parseFloat(n[1]) + 360) % 360,
                l(parseFloat(n[2]), 0, 100),
                l(parseFloat(n[3]), 0, 100),
                l(isNaN(t) ? 1 : t, 0, 1),
              ];
            }
            return null;
          }),
          (u.get.hwb = function (r) {
            if (!r) return null;
            var n = r.match(
              /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
            );
            if (n) {
              var t = parseFloat(n[4]);
              return [
                ((parseFloat(n[1]) % 360) + 360) % 360,
                l(parseFloat(n[2]), 0, 100),
                l(parseFloat(n[3]), 0, 100),
                l(isNaN(t) ? 1 : t, 0, 1),
              ];
            }
            return null;
          }),
          (u.to.hex = function () {
            var r = a(arguments);
            return (
              "#" +
              c(r[0]) +
              c(r[1]) +
              c(r[2]) +
              (r[3] < 1 ? c(Math.round(255 * r[3])) : "")
            );
          }),
          (u.to.rgb = function () {
            var r = a(arguments);
            return r.length < 4 || 1 === r[3]
              ? "rgb(" +
                  Math.round(r[0]) +
                  ", " +
                  Math.round(r[1]) +
                  ", " +
                  Math.round(r[2]) +
                  ")"
              : "rgba(" +
                  Math.round(r[0]) +
                  ", " +
                  Math.round(r[1]) +
                  ", " +
                  Math.round(r[2]) +
                  ", " +
                  r[3] +
                  ")";
          }),
          (u.to.rgb.percent = function () {
            var r = a(arguments),
              n = Math.round((r[0] / 255) * 100),
              t = Math.round((r[1] / 255) * 100),
              e = Math.round((r[2] / 255) * 100);
            return r.length < 4 || 1 === r[3]
              ? "rgb(" + n + "%, " + t + "%, " + e + "%)"
              : "rgba(" + n + "%, " + t + "%, " + e + "%, " + r[3] + ")";
          }),
          (u.to.hsl = function () {
            var r = a(arguments);
            return r.length < 4 || 1 === r[3]
              ? "hsl(" + r[0] + ", " + r[1] + "%, " + r[2] + "%)"
              : "hsla(" +
                  r[0] +
                  ", " +
                  r[1] +
                  "%, " +
                  r[2] +
                  "%, " +
                  r[3] +
                  ")";
          }),
          (u.to.hwb = function () {
            var r = a(arguments),
              n = "";
            return (
              r.length >= 4 && 1 !== r[3] && (n = ", " + r[3]),
              "hwb(" + r[0] + ", " + r[1] + "%, " + r[2] + "%" + n + ")"
            );
          }),
          (u.to.keyword = function (r) {
            return o[r.slice(0, 3)];
          });
      },
      767: function (r, n, t) {
        "use strict";
        var e = t(818),
          a = t(85),
          o = [].slice,
          i = ["keyword", "gray", "hex"],
          u = {};
        Object.keys(a).forEach(function (r) {
          u[o.call(a[r].labels).sort().join("")] = r;
        });
        var l = {};
        function c(r, n) {
          if (!(this instanceof c)) return new c(r, n);
          if ((n && n in i && (n = null), n && !(n in a)))
            throw new Error("Unknown model: " + n);
          var t, s;
          if (null == r)
            (this.model = "rgb"), (this.color = [0, 0, 0]), (this.valpha = 1);
          else if (r instanceof c)
            (this.model = r.model),
              (this.color = r.color.slice()),
              (this.valpha = r.valpha);
          else if ("string" == typeof r) {
            var h = e.get(r);
            if (null === h)
              throw new Error("Unable to parse color from string: " + r);
            (this.model = h.model),
              (s = a[this.model].channels),
              (this.color = h.value.slice(0, s)),
              (this.valpha = "number" == typeof h.value[s] ? h.value[s] : 1);
          } else if (r.length) {
            (this.model = n || "rgb"), (s = a[this.model].channels);
            var f = o.call(r, 0, s);
            (this.color = g(f, s)),
              (this.valpha = "number" == typeof r[s] ? r[s] : 1);
          } else if ("number" == typeof r)
            (r &= 16777215),
              (this.model = "rgb"),
              (this.color = [(r >> 16) & 255, (r >> 8) & 255, 255 & r]),
              (this.valpha = 1);
          else {
            this.valpha = 1;
            var d = Object.keys(r);
            "alpha" in r &&
              (d.splice(d.indexOf("alpha"), 1),
              (this.valpha = "number" == typeof r.alpha ? r.alpha : 0));
            var p = d.sort().join("");
            if (!(p in u))
              throw new Error(
                "Unable to parse color from object: " + JSON.stringify(r),
              );
            this.model = u[p];
            var b = a[this.model].labels,
              m = [];
            for (t = 0; t < b.length; t++) m.push(r[b[t]]);
            this.color = g(m);
          }
          if (l[this.model])
            for (s = a[this.model].channels, t = 0; t < s; t++) {
              var v = l[this.model][t];
              v && (this.color[t] = v(this.color[t]));
            }
          (this.valpha = Math.max(0, Math.min(1, this.valpha))),
            Object.freeze && Object.freeze(this);
        }
        function s(r, n, t) {
          return (
            (r = Array.isArray(r) ? r : [r]).forEach(function (r) {
              (l[r] || (l[r] = []))[n] = t;
            }),
            (r = r[0]),
            function (e) {
              var a;
              return arguments.length
                ? (t && (e = t(e)), ((a = this[r]()).color[n] = e), a)
                : ((a = this[r]().color[n]), t && (a = t(a)), a);
            }
          );
        }
        function h(r) {
          return function (n) {
            return Math.max(0, Math.min(r, n));
          };
        }
        function f(r) {
          return Array.isArray(r) ? r : [r];
        }
        function g(r, n) {
          for (var t = 0; t < n; t++) "number" != typeof r[t] && (r[t] = 0);
          return r;
        }
        (c.prototype = {
          toString: function () {
            return this.string();
          },
          toJSON: function () {
            return this[this.model]();
          },
          string: function (r) {
            var n = this.model in e.to ? this : this.rgb(),
              t =
                1 === (n = n.round("number" == typeof r ? r : 1)).valpha
                  ? n.color
                  : n.color.concat(this.valpha);
            return e.to[n.model](t);
          },
          percentString: function (r) {
            var n = this.rgb().round("number" == typeof r ? r : 1),
              t = 1 === n.valpha ? n.color : n.color.concat(this.valpha);
            return e.to.rgb.percent(t);
          },
          array: function () {
            return 1 === this.valpha
              ? this.color.slice()
              : this.color.concat(this.valpha);
          },
          object: function () {
            for (
              var r = {},
                n = a[this.model].channels,
                t = a[this.model].labels,
                e = 0;
              e < n;
              e++
            )
              r[t[e]] = this.color[e];
            return 1 !== this.valpha && (r.alpha = this.valpha), r;
          },
          unitArray: function () {
            var r = this.rgb().color;
            return (
              (r[0] /= 255),
              (r[1] /= 255),
              (r[2] /= 255),
              1 !== this.valpha && r.push(this.valpha),
              r
            );
          },
          unitObject: function () {
            var r = this.rgb().object();
            return (
              (r.r /= 255),
              (r.g /= 255),
              (r.b /= 255),
              1 !== this.valpha && (r.alpha = this.valpha),
              r
            );
          },
          round: function (r) {
            return (
              (r = Math.max(r || 0, 0)),
              new c(
                this.color
                  .map(
                    (function (r) {
                      return function (n) {
                        return (function (r, n) {
                          return Number(r.toFixed(n));
                        })(n, r);
                      };
                    })(r),
                  )
                  .concat(this.valpha),
                this.model,
              )
            );
          },
          alpha: function (r) {
            return arguments.length
              ? new c(
                  this.color.concat(Math.max(0, Math.min(1, r))),
                  this.model,
                )
              : this.valpha;
          },
          red: s("rgb", 0, h(255)),
          green: s("rgb", 1, h(255)),
          blue: s("rgb", 2, h(255)),
          hue: s(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function (r) {
            return ((r % 360) + 360) % 360;
          }),
          saturationl: s("hsl", 1, h(100)),
          lightness: s("hsl", 2, h(100)),
          saturationv: s("hsv", 1, h(100)),
          value: s("hsv", 2, h(100)),
          chroma: s("hcg", 1, h(100)),
          gray: s("hcg", 2, h(100)),
          white: s("hwb", 1, h(100)),
          wblack: s("hwb", 2, h(100)),
          cyan: s("cmyk", 0, h(100)),
          magenta: s("cmyk", 1, h(100)),
          yellow: s("cmyk", 2, h(100)),
          black: s("cmyk", 3, h(100)),
          x: s("xyz", 0, h(100)),
          y: s("xyz", 1, h(100)),
          z: s("xyz", 2, h(100)),
          l: s("lab", 0, h(100)),
          a: s("lab", 1),
          b: s("lab", 2),
          keyword: function (r) {
            return arguments.length
              ? new c(r)
              : a[this.model].keyword(this.color);
          },
          hex: function (r) {
            return arguments.length
              ? new c(r)
              : e.to.hex(this.rgb().round().color);
          },
          rgbNumber: function () {
            var r = this.rgb().color;
            return ((255 & r[0]) << 16) | ((255 & r[1]) << 8) | (255 & r[2]);
          },
          luminosity: function () {
            for (var r = this.rgb().color, n = [], t = 0; t < r.length; t++) {
              var e = r[t] / 255;
              n[t] =
                e <= 0.03928 ? e / 12.92 : Math.pow((e + 0.055) / 1.055, 2.4);
            }
            return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
          },
          contrast: function (r) {
            var n = this.luminosity(),
              t = r.luminosity();
            return n > t ? (n + 0.05) / (t + 0.05) : (t + 0.05) / (n + 0.05);
          },
          level: function (r) {
            var n = this.contrast(r);
            return n >= 7.1 ? "AAA" : n >= 4.5 ? "AA" : "";
          },
          isDark: function () {
            var r = this.rgb().color;
            return (299 * r[0] + 587 * r[1] + 114 * r[2]) / 1e3 < 128;
          },
          isLight: function () {
            return !this.isDark();
          },
          negate: function () {
            for (var r = this.rgb(), n = 0; n < 3; n++)
              r.color[n] = 255 - r.color[n];
            return r;
          },
          lighten: function (r) {
            var n = this.hsl();
            return (n.color[2] += n.color[2] * r), n;
          },
          darken: function (r) {
            var n = this.hsl();
            return (n.color[2] -= n.color[2] * r), n;
          },
          saturate: function (r) {
            var n = this.hsl();
            return (n.color[1] += n.color[1] * r), n;
          },
          desaturate: function (r) {
            var n = this.hsl();
            return (n.color[1] -= n.color[1] * r), n;
          },
          whiten: function (r) {
            var n = this.hwb();
            return (n.color[1] += n.color[1] * r), n;
          },
          blacken: function (r) {
            var n = this.hwb();
            return (n.color[2] += n.color[2] * r), n;
          },
          grayscale: function () {
            var r = this.rgb().color,
              n = 0.3 * r[0] + 0.59 * r[1] + 0.11 * r[2];
            return c.rgb(n, n, n);
          },
          fade: function (r) {
            return this.alpha(this.valpha - this.valpha * r);
          },
          opaquer: function (r) {
            return this.alpha(this.valpha + this.valpha * r);
          },
          rotate: function (r) {
            var n = this.hsl(),
              t = n.color[0];
            return (
              (t = (t = (t + r) % 360) < 0 ? 360 + t : t), (n.color[0] = t), n
            );
          },
          mix: function (r, n) {
            if (!r || !r.rgb)
              throw new Error(
                'Argument to "mix" was not a Color instance, but rather an instance of ' +
                  typeof r,
              );
            var t = r.rgb(),
              e = this.rgb(),
              a = void 0 === n ? 0.5 : n,
              o = 2 * a - 1,
              i = t.alpha() - e.alpha(),
              u = ((o * i == -1 ? o : (o + i) / (1 + o * i)) + 1) / 2,
              l = 1 - u;
            return c.rgb(
              u * t.red() + l * e.red(),
              u * t.green() + l * e.green(),
              u * t.blue() + l * e.blue(),
              t.alpha() * a + e.alpha() * (1 - a),
            );
          },
        }),
          Object.keys(a).forEach(function (r) {
            if (-1 === i.indexOf(r)) {
              var n = a[r].channels;
              (c.prototype[r] = function () {
                if (this.model === r) return new c(this);
                if (arguments.length) return new c(arguments, r);
                var t = "number" == typeof arguments[n] ? n : this.valpha;
                return new c(f(a[this.model][r].raw(this.color)).concat(t), r);
              }),
                (c[r] = function (t) {
                  return (
                    "number" == typeof t && (t = g(o.call(arguments), n)),
                    new c(t, r)
                  );
                });
            }
          }),
          (r.exports = c);
      },
      851: function (r, n, t) {
        "use strict";
        var e = t(594),
          a = Array.prototype.concat,
          o = Array.prototype.slice,
          i = (r.exports = function (r) {
            for (var n = [], t = 0, i = r.length; t < i; t++) {
              var u = r[t];
              e(u) ? (n = a.call(n, o.call(u))) : n.push(u);
            }
            return n;
          });
        i.wrap = function (r) {
          return function () {
            return r(i(arguments));
          };
        };
      },
      594: function (r) {
        r.exports = function (r) {
          return (
            !(!r || "string" == typeof r) &&
            (r instanceof Array ||
              Array.isArray(r) ||
              (r.length >= 0 &&
                (r.splice instanceof Function ||
                  (Object.getOwnPropertyDescriptor(r, r.length - 1) &&
                    "String" !== r.constructor.name))))
          );
        };
      },
    },
    n = {};
  function t(e) {
    var a = n[e];
    if (void 0 !== a) return a.exports;
    var o = (n[e] = { exports: {} });
    return r[e](o, o.exports, t), o.exports;
  }
  (t.n = function (r) {
    var n =
      r && r.__esModule
        ? function () {
            return r.default;
          }
        : function () {
            return r;
          };
    return t.d(n, { a: n }), n;
  }),
    (t.d = function (r, n) {
      for (var e in n)
        t.o(n, e) &&
          !t.o(r, e) &&
          Object.defineProperty(r, e, { enumerable: !0, get: n[e] });
    }),
    (t.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (r) {
        if ("object" == typeof window) return window;
      }
    })()),
    (t.o = function (r, n) {
      return Object.prototype.hasOwnProperty.call(r, n);
    }),
    (t.r = function (r) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(r, "__esModule", { value: !0 });
    });
  var e = {};
  !(function () {
    "use strict";
    t.r(e);
    var r = t(767),
      n = t.n(r);
    function a(r, n) {
      var t = Object.keys(r);
      if (Object.getOwnPropertySymbols) {
        var e = Object.getOwnPropertySymbols(r);
        n &&
          (e = e.filter(function (n) {
            return Object.getOwnPropertyDescriptor(r, n).enumerable;
          })),
          t.push.apply(t, e);
      }
      return t;
    }
    function o(r) {
      for (var n = 1; n < arguments.length; n++) {
        var t = null != arguments[n] ? arguments[n] : {};
        n % 2
          ? a(Object(t), !0).forEach(function (n) {
              i(r, n, t[n]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(t))
          : a(Object(t)).forEach(function (n) {
              Object.defineProperty(
                r,
                n,
                Object.getOwnPropertyDescriptor(t, n),
              );
            });
      }
      return r;
    }
    function i(r, n, t) {
      return (
        n in r
          ? Object.defineProperty(r, n, {
              value: t,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[n] = t),
        r
      );
    }
    var u = {
        brand: "#587330",
        summarize: "#88BF4D",
        filter: "#7172AD",
        accent0: "#587330",
        accent1: "#88BF4D",
        accent2: "#A989C5",
        accent3: "#EF8C8C",
        accent4: "#F9D45C",
        accent5: "#F2A86F",
        accent6: "#98D9D9",
        accent7: "#7172AD",
        "admin-navbar": "#7172AD",
        white: "#FFFFFF",
        black: "#2E353B",
        success: "#84BB4C",
        danger: "#ED6E6E",
        error: "#ED6E6E",
        warning: "#F9CF48",
        "text-dark": "#4C5773",
        "text-medium": "#696E7B",
        "text-light": "#949AAB",
        "text-white": "#FFFFFF",
        "bg-black": "#2E353B",
        "bg-dark": "#93A1AB",
        "bg-medium": "#EDF2F5",
        "bg-light": "#F9FBFC",
        "bg-white": "#FFFFFF",
        "bg-yellow": "#FFFCF2",
        "bg-night": "#42484E",
        "bg-error": "#ED6E6E55",
        shadow: "rgba(0,0,0,0.08)",
        border: "#EEECEC",
        "saturated-blue": "#2D86D4",
        "saturated-green": "#70A63A",
        "saturated-purple": "#885AB1",
        "saturated-red": "#ED6E6E",
        "saturated-yellow": "#F9CF48",
      },
      l =
        (o({}, u),
        {
          dashboard: function (r) {
            return c("brand", r);
          },
          nav: function (r) {
            return c("bg-white", r);
          },
          content: function (r) {
            return c("bg-light", r);
          },
          database: function (r) {
            return c("accent2", r);
          },
          pulse: function (r) {
            return c("accent4", r);
          },
          "brand-light": function (r) {
            return h(c("brand", r), 0.532);
          },
          focus: function (r) {
            return d("brand", r);
          },
          "accent0-light": function (r) {
            return f(c("accent0", r));
          },
          "accent1-light": function (r) {
            return f(c("accent1", r));
          },
          "accent2-light": function (r) {
            return f(c("accent2", r));
          },
          "accent3-light": function (r) {
            return f(c("accent3", r));
          },
          "accent4-light": function (r) {
            return f(c("accent4", r));
          },
          "accent5-light": function (r) {
            return f(c("accent5", r));
          },
          "accent6-light": function (r) {
            return f(c("accent6", r));
          },
          "accent7-light": function (r) {
            return f(c("accent7", r));
          },
          "accent0-dark": function (r) {
            return g(c("accent0", r));
          },
          "accent1-dark": function (r) {
            return g(c("accent1", r));
          },
          "accent2-dark": function (r) {
            return g(c("accent2", r));
          },
          "accent3-dark": function (r) {
            return g(c("accent3", r));
          },
          "accent4-dark": function (r) {
            return g(c("accent4", r));
          },
          "accent5-dark": function (r) {
            return g(c("accent5", r));
          },
          "accent6-dark": function (r) {
            return g(c("accent6", r));
          },
          "accent7-dark": function (r) {
            return g(c("accent7", r));
          },
        });
    function c(r) {
      var n =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : u,
        t = o(o({}, u), n);
      return r in t ? t[r] : r in l ? l[r](n) : r;
    }
    var s = function (r, t) {
        return n()(c(r)).alpha(t).string();
      },
      h = function (r) {
        var t =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0.5;
        return n()(c(r)).lighten(t).string();
      },
      f = function (r) {
        var t =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : 0.125,
          e = n()(c(r));
        return e.lightness(e.lightness() + 100 * t).hex();
      },
      g = function (r) {
        var t =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : 0.125,
          e = n()(c(r));
        return e.lightness(e.lightness() - 100 * t).hex();
      },
      d = function (r) {
        var n =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : u;
        return h(c(r, n), 0.465);
      },
      p = Math.sqrt(50),
      b = Math.sqrt(10),
      m = Math.sqrt(2);
    function v(r, n, t) {
      var e = (n - r) / Math.max(0, t),
        a = Math.floor(Math.log(e) / Math.LN10),
        o = e / Math.pow(10, a);
      return a >= 0
        ? (o >= p ? 10 : o >= b ? 5 : o >= m ? 2 : 1) * Math.pow(10, a)
        : -Math.pow(10, -a) / (o >= p ? 10 : o >= b ? 5 : o >= m ? 2 : 1);
    }
    function y(r, n) {
      return r < n ? -1 : r > n ? 1 : r >= n ? 0 : NaN;
    }
    function w(r) {
      let n = r,
        t = r;
      function e(r, n, e, a) {
        for (null == e && (e = 0), null == a && (a = r.length); e < a; ) {
          const o = (e + a) >>> 1;
          t(r[o], n) < 0 ? (e = o + 1) : (a = o);
        }
        return e;
      }
      return (
        1 === r.length &&
          ((n = (n, t) => r(n) - t),
          (t = (function (r) {
            return (n, t) => y(r(n), t);
          })(r))),
        {
          left: e,
          center: function (r, t, a, o) {
            null == a && (a = 0), null == o && (o = r.length);
            const i = e(r, t, a, o - 1);
            return i > a && n(r[i - 1], t) > -n(r[i], t) ? i - 1 : i;
          },
          right: function (r, n, e, a) {
            for (null == e && (e = 0), null == a && (a = r.length); e < a; ) {
              const o = (e + a) >>> 1;
              t(r[o], n) > 0 ? (a = o) : (e = o + 1);
            }
            return e;
          },
        }
      );
    }
    const M = w(y),
      k = M.right;
    M.left,
      w(function (r) {
        return null === r ? NaN : +r;
      }).center;
    var x = k;
    function N(r, n, t) {
      (r.prototype = n.prototype = t), (t.constructor = r);
    }
    function A(r, n) {
      var t = Object.create(r.prototype);
      for (var e in n) t[e] = n[e];
      return t;
    }
    function E() {}
    var O = 0.7,
      j = 1 / O,
      F = "\\s*([+-]?\\d+)\\s*",
      S = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      q = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      P = /^#([0-9a-f]{3,8})$/,
      D = new RegExp("^rgb\\(" + [F, F, F] + "\\)$"),
      z = new RegExp("^rgb\\(" + [q, q, q] + "\\)$"),
      C = new RegExp("^rgba\\(" + [F, F, F, S] + "\\)$"),
      $ = new RegExp("^rgba\\(" + [q, q, q, S] + "\\)$"),
      I = new RegExp("^hsl\\(" + [S, q, q] + "\\)$"),
      R = new RegExp("^hsla\\(" + [S, q, q, S] + "\\)$"),
      B = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074,
      };
    function U() {
      return this.rgb().formatHex();
    }
    function _() {
      return this.rgb().formatRgb();
    }
    function T(r) {
      var n, t;
      return (
        (r = (r + "").trim().toLowerCase()),
        (n = P.exec(r))
          ? ((t = n[1].length),
            (n = parseInt(n[1], 16)),
            6 === t
              ? L(n)
              : 3 === t
              ? new V(
                  ((n >> 8) & 15) | ((n >> 4) & 240),
                  ((n >> 4) & 15) | (240 & n),
                  ((15 & n) << 4) | (15 & n),
                  1,
                )
              : 8 === t
              ? H(
                  (n >> 24) & 255,
                  (n >> 16) & 255,
                  (n >> 8) & 255,
                  (255 & n) / 255,
                )
              : 4 === t
              ? H(
                  ((n >> 12) & 15) | ((n >> 8) & 240),
                  ((n >> 8) & 15) | ((n >> 4) & 240),
                  ((n >> 4) & 15) | (240 & n),
                  (((15 & n) << 4) | (15 & n)) / 255,
                )
              : null)
          : (n = D.exec(r))
          ? new V(n[1], n[2], n[3], 1)
          : (n = z.exec(r))
          ? new V((255 * n[1]) / 100, (255 * n[2]) / 100, (255 * n[3]) / 100, 1)
          : (n = C.exec(r))
          ? H(n[1], n[2], n[3], n[4])
          : (n = $.exec(r))
          ? H((255 * n[1]) / 100, (255 * n[2]) / 100, (255 * n[3]) / 100, n[4])
          : (n = I.exec(r))
          ? Z(n[1], n[2] / 100, n[3] / 100, 1)
          : (n = R.exec(r))
          ? Z(n[1], n[2] / 100, n[3] / 100, n[4])
          : B.hasOwnProperty(r)
          ? L(B[r])
          : "transparent" === r
          ? new V(NaN, NaN, NaN, 0)
          : null
      );
    }
    function L(r) {
      return new V((r >> 16) & 255, (r >> 8) & 255, 255 & r, 1);
    }
    function H(r, n, t, e) {
      return e <= 0 && (r = n = t = NaN), new V(r, n, t, e);
    }
    function J(r) {
      return (
        r instanceof E || (r = T(r)),
        r ? new V((r = r.rgb()).r, r.g, r.b, r.opacity) : new V()
      );
    }
    function G(r, n, t, e) {
      return 1 === arguments.length ? J(r) : new V(r, n, t, null == e ? 1 : e);
    }
    function V(r, n, t, e) {
      (this.r = +r), (this.g = +n), (this.b = +t), (this.opacity = +e);
    }
    function W() {
      return "#" + Y(this.r) + Y(this.g) + Y(this.b);
    }
    function X() {
      var r = this.opacity;
      return (
        (1 === (r = isNaN(r) ? 1 : Math.max(0, Math.min(1, r)))
          ? "rgb("
          : "rgba(") +
        Math.max(0, Math.min(255, Math.round(this.r) || 0)) +
        ", " +
        Math.max(0, Math.min(255, Math.round(this.g) || 0)) +
        ", " +
        Math.max(0, Math.min(255, Math.round(this.b) || 0)) +
        (1 === r ? ")" : ", " + r + ")")
      );
    }
    function Y(r) {
      return (
        ((r = Math.max(0, Math.min(255, Math.round(r) || 0))) < 16 ? "0" : "") +
        r.toString(16)
      );
    }
    function Z(r, n, t, e) {
      return (
        e <= 0
          ? (r = n = t = NaN)
          : t <= 0 || t >= 1
          ? (r = n = NaN)
          : n <= 0 && (r = NaN),
        new Q(r, n, t, e)
      );
    }
    function K(r) {
      if (r instanceof Q) return new Q(r.h, r.s, r.l, r.opacity);
      if ((r instanceof E || (r = T(r)), !r)) return new Q();
      if (r instanceof Q) return r;
      var n = (r = r.rgb()).r / 255,
        t = r.g / 255,
        e = r.b / 255,
        a = Math.min(n, t, e),
        o = Math.max(n, t, e),
        i = NaN,
        u = o - a,
        l = (o + a) / 2;
      return (
        u
          ? ((i =
              n === o
                ? (t - e) / u + 6 * (t < e)
                : t === o
                ? (e - n) / u + 2
                : (n - t) / u + 4),
            (u /= l < 0.5 ? o + a : 2 - o - a),
            (i *= 60))
          : (u = l > 0 && l < 1 ? 0 : i),
        new Q(i, u, l, r.opacity)
      );
    }
    function Q(r, n, t, e) {
      (this.h = +r), (this.s = +n), (this.l = +t), (this.opacity = +e);
    }
    function rr(r, n, t) {
      return (
        255 *
        (r < 60
          ? n + ((t - n) * r) / 60
          : r < 180
          ? t
          : r < 240
          ? n + ((t - n) * (240 - r)) / 60
          : n)
      );
    }
    function nr(r, n, t, e, a) {
      var o = r * r,
        i = o * r;
      return (
        ((1 - 3 * r + 3 * o - i) * n +
          (4 - 6 * o + 3 * i) * t +
          (1 + 3 * r + 3 * o - 3 * i) * e +
          i * a) /
        6
      );
    }
    N(E, T, {
      copy: function (r) {
        return Object.assign(new this.constructor(), this, r);
      },
      displayable: function () {
        return this.rgb().displayable();
      },
      hex: U,
      formatHex: U,
      formatHsl: function () {
        return K(this).formatHsl();
      },
      formatRgb: _,
      toString: _,
    }),
      N(
        V,
        G,
        A(E, {
          brighter: function (r) {
            return (
              (r = null == r ? j : Math.pow(j, r)),
              new V(this.r * r, this.g * r, this.b * r, this.opacity)
            );
          },
          darker: function (r) {
            return (
              (r = null == r ? O : Math.pow(O, r)),
              new V(this.r * r, this.g * r, this.b * r, this.opacity)
            );
          },
          rgb: function () {
            return this;
          },
          displayable: function () {
            return (
              -0.5 <= this.r &&
              this.r < 255.5 &&
              -0.5 <= this.g &&
              this.g < 255.5 &&
              -0.5 <= this.b &&
              this.b < 255.5 &&
              0 <= this.opacity &&
              this.opacity <= 1
            );
          },
          hex: W,
          formatHex: W,
          formatRgb: X,
          toString: X,
        }),
      ),
      N(
        Q,
        function (r, n, t, e) {
          return 1 === arguments.length
            ? K(r)
            : new Q(r, n, t, null == e ? 1 : e);
        },
        A(E, {
          brighter: function (r) {
            return (
              (r = null == r ? j : Math.pow(j, r)),
              new Q(this.h, this.s, this.l * r, this.opacity)
            );
          },
          darker: function (r) {
            return (
              (r = null == r ? O : Math.pow(O, r)),
              new Q(this.h, this.s, this.l * r, this.opacity)
            );
          },
          rgb: function () {
            var r = (this.h % 360) + 360 * (this.h < 0),
              n = isNaN(r) || isNaN(this.s) ? 0 : this.s,
              t = this.l,
              e = t + (t < 0.5 ? t : 1 - t) * n,
              a = 2 * t - e;
            return new V(
              rr(r >= 240 ? r - 240 : r + 120, a, e),
              rr(r, a, e),
              rr(r < 120 ? r + 240 : r - 120, a, e),
              this.opacity,
            );
          },
          displayable: function () {
            return (
              ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
              0 <= this.l &&
              this.l <= 1 &&
              0 <= this.opacity &&
              this.opacity <= 1
            );
          },
          formatHsl: function () {
            var r = this.opacity;
            return (
              (1 === (r = isNaN(r) ? 1 : Math.max(0, Math.min(1, r)))
                ? "hsl("
                : "hsla(") +
              (this.h || 0) +
              ", " +
              100 * (this.s || 0) +
              "%, " +
              100 * (this.l || 0) +
              "%" +
              (1 === r ? ")" : ", " + r + ")")
            );
          },
        }),
      );
    var tr = r => () => r;
    function er(r, n) {
      var t = n - r;
      return t
        ? (function (r, n) {
            return function (t) {
              return r + t * n;
            };
          })(r, t)
        : tr(isNaN(r) ? n : r);
    }
    var ar = (function r(n) {
      var t = (function (r) {
        return 1 == (r = +r)
          ? er
          : function (n, t) {
              return t - n
                ? (function (r, n, t) {
                    return (
                      (r = Math.pow(r, t)),
                      (n = Math.pow(n, t) - r),
                      (t = 1 / t),
                      function (e) {
                        return Math.pow(r + e * n, t);
                      }
                    );
                  })(n, t, r)
                : tr(isNaN(n) ? t : n);
            };
      })(n);
      function e(r, n) {
        var e = t((r = G(r)).r, (n = G(n)).r),
          a = t(r.g, n.g),
          o = t(r.b, n.b),
          i = er(r.opacity, n.opacity);
        return function (n) {
          return (
            (r.r = e(n)), (r.g = a(n)), (r.b = o(n)), (r.opacity = i(n)), r + ""
          );
        };
      }
      return (e.gamma = r), e;
    })(1);
    function or(r) {
      return function (n) {
        var t,
          e,
          a = n.length,
          o = new Array(a),
          i = new Array(a),
          u = new Array(a);
        for (t = 0; t < a; ++t)
          (e = G(n[t])),
            (o[t] = e.r || 0),
            (i[t] = e.g || 0),
            (u[t] = e.b || 0);
        return (
          (o = r(o)),
          (i = r(i)),
          (u = r(u)),
          (e.opacity = 1),
          function (r) {
            return (e.r = o(r)), (e.g = i(r)), (e.b = u(r)), e + "";
          }
        );
      };
    }
    function ir(r, n) {
      var t,
        e = n ? n.length : 0,
        a = r ? Math.min(e, r.length) : 0,
        o = new Array(a),
        i = new Array(e);
      for (t = 0; t < a; ++t) o[t] = dr(r[t], n[t]);
      for (; t < e; ++t) i[t] = n[t];
      return function (r) {
        for (t = 0; t < a; ++t) i[t] = o[t](r);
        return i;
      };
    }
    function ur(r, n) {
      var t = new Date();
      return (
        (r = +r),
        (n = +n),
        function (e) {
          return t.setTime(r * (1 - e) + n * e), t;
        }
      );
    }
    function lr(r, n) {
      return (
        (r = +r),
        (n = +n),
        function (t) {
          return r * (1 - t) + n * t;
        }
      );
    }
    function cr(r, n) {
      var t,
        e = {},
        a = {};
      for (t in ((null !== r && "object" == typeof r) || (r = {}),
      (null !== n && "object" == typeof n) || (n = {}),
      n))
        t in r ? (e[t] = dr(r[t], n[t])) : (a[t] = n[t]);
      return function (r) {
        for (t in e) a[t] = e[t](r);
        return a;
      };
    }
    or(function (r) {
      var n = r.length - 1;
      return function (t) {
        var e =
            t <= 0 ? (t = 0) : t >= 1 ? ((t = 1), n - 1) : Math.floor(t * n),
          a = r[e],
          o = r[e + 1],
          i = e > 0 ? r[e - 1] : 2 * a - o,
          u = e < n - 1 ? r[e + 2] : 2 * o - a;
        return nr((t - e / n) * n, i, a, o, u);
      };
    }),
      or(function (r) {
        var n = r.length;
        return function (t) {
          var e = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
            a = r[(e + n - 1) % n],
            o = r[e % n],
            i = r[(e + 1) % n],
            u = r[(e + 2) % n];
          return nr((t - e / n) * n, a, o, i, u);
        };
      });
    var sr = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      hr = new RegExp(sr.source, "g");
    function fr(r, n) {
      var t,
        e,
        a,
        o = (sr.lastIndex = hr.lastIndex = 0),
        i = -1,
        u = [],
        l = [];
      for (r += "", n += ""; (t = sr.exec(r)) && (e = hr.exec(n)); )
        (a = e.index) > o &&
          ((a = n.slice(o, a)), u[i] ? (u[i] += a) : (u[++i] = a)),
          (t = t[0]) === (e = e[0])
            ? u[i]
              ? (u[i] += e)
              : (u[++i] = e)
            : ((u[++i] = null), l.push({ i: i, x: lr(t, e) })),
          (o = hr.lastIndex);
      return (
        o < n.length && ((a = n.slice(o)), u[i] ? (u[i] += a) : (u[++i] = a)),
        u.length < 2
          ? l[0]
            ? (function (r) {
                return function (n) {
                  return r(n) + "";
                };
              })(l[0].x)
            : (function (r) {
                return function () {
                  return r;
                };
              })(n)
          : ((n = l.length),
            function (r) {
              for (var t, e = 0; e < n; ++e) u[(t = l[e]).i] = t.x(r);
              return u.join("");
            })
      );
    }
    function gr(r, n) {
      n || (n = []);
      var t,
        e = r ? Math.min(n.length, r.length) : 0,
        a = n.slice();
      return function (o) {
        for (t = 0; t < e; ++t) a[t] = r[t] * (1 - o) + n[t] * o;
        return a;
      };
    }
    function dr(r, n) {
      var t,
        e,
        a = typeof n;
      return null == n || "boolean" === a
        ? tr(n)
        : ("number" === a
            ? lr
            : "string" === a
            ? (t = T(n))
              ? ((n = t), ar)
              : fr
            : n instanceof T
            ? ar
            : n instanceof Date
            ? ur
            : ((e = n),
              !ArrayBuffer.isView(e) || e instanceof DataView
                ? Array.isArray(n)
                  ? ir
                  : ("function" != typeof n.valueOf &&
                      "function" != typeof n.toString) ||
                    isNaN(n)
                  ? cr
                  : lr
                : gr))(r, n);
    }
    function pr(r, n) {
      return (
        (r = +r),
        (n = +n),
        function (t) {
          return Math.round(r * (1 - t) + n * t);
        }
      );
    }
    function br(r) {
      return +r;
    }
    var mr = [0, 1];
    function vr(r) {
      return r;
    }
    function yr(r, n) {
      return (n -= r = +r)
        ? function (t) {
            return (t - r) / n;
          }
        : ((t = isNaN(n) ? NaN : 0.5),
          function () {
            return t;
          });
      var t;
    }
    function wr(r, n, t) {
      var e = r[0],
        a = r[1],
        o = n[0],
        i = n[1];
      return (
        a < e
          ? ((e = yr(a, e)), (o = t(i, o)))
          : ((e = yr(e, a)), (o = t(o, i))),
        function (r) {
          return o(e(r));
        }
      );
    }
    function Mr(r, n, t) {
      var e = Math.min(r.length, n.length) - 1,
        a = new Array(e),
        o = new Array(e),
        i = -1;
      for (
        r[e] < r[0] && ((r = r.slice().reverse()), (n = n.slice().reverse()));
        ++i < e;

      )
        (a[i] = yr(r[i], r[i + 1])), (o[i] = t(n[i], n[i + 1]));
      return function (n) {
        var t = x(r, n, 1, e) - 1;
        return o[t](a[t](n));
      };
    }
    function kr(r, n) {
      return n
        .domain(r.domain())
        .range(r.range())
        .interpolate(r.interpolate())
        .clamp(r.clamp())
        .unknown(r.unknown());
    }
    function xr() {
      return (function () {
        var r,
          n,
          t,
          e,
          a,
          o,
          i = mr,
          u = mr,
          l = dr,
          c = vr;
        function s() {
          var r,
            n,
            t,
            l = Math.min(i.length, u.length);
          return (
            c !== vr &&
              ((r = i[0]),
              (n = i[l - 1]),
              r > n && ((t = r), (r = n), (n = t)),
              (c = function (t) {
                return Math.max(r, Math.min(n, t));
              })),
            (e = l > 2 ? Mr : wr),
            (a = o = null),
            h
          );
        }
        function h(n) {
          return null == n || isNaN((n = +n))
            ? t
            : (a || (a = e(i.map(r), u, l)))(r(c(n)));
        }
        return (
          (h.invert = function (t) {
            return c(n((o || (o = e(u, i.map(r), lr)))(t)));
          }),
          (h.domain = function (r) {
            return arguments.length
              ? ((i = Array.from(r, br)), s())
              : i.slice();
          }),
          (h.range = function (r) {
            return arguments.length ? ((u = Array.from(r)), s()) : u.slice();
          }),
          (h.rangeRound = function (r) {
            return (u = Array.from(r)), (l = pr), s();
          }),
          (h.clamp = function (r) {
            return arguments.length ? ((c = !!r || vr), s()) : c !== vr;
          }),
          (h.interpolate = function (r) {
            return arguments.length ? ((l = r), s()) : l;
          }),
          (h.unknown = function (r) {
            return arguments.length ? ((t = r), h) : t;
          }),
          function (t, e) {
            return (r = t), (n = e), s();
          }
        );
      })()(vr, vr);
    }
    function Nr(r, n) {
      switch (arguments.length) {
        case 0:
          break;
        case 1:
          this.range(r);
          break;
        default:
          this.range(n).domain(r);
      }
      return this;
    }
    var Ar,
      Er =
        /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
    function Or(r) {
      if (!(n = Er.exec(r))) throw new Error("invalid format: " + r);
      var n;
      return new jr({
        fill: n[1],
        align: n[2],
        sign: n[3],
        symbol: n[4],
        zero: n[5],
        width: n[6],
        comma: n[7],
        precision: n[8] && n[8].slice(1),
        trim: n[9],
        type: n[10],
      });
    }
    function jr(r) {
      (this.fill = void 0 === r.fill ? " " : r.fill + ""),
        (this.align = void 0 === r.align ? ">" : r.align + ""),
        (this.sign = void 0 === r.sign ? "-" : r.sign + ""),
        (this.symbol = void 0 === r.symbol ? "" : r.symbol + ""),
        (this.zero = !!r.zero),
        (this.width = void 0 === r.width ? void 0 : +r.width),
        (this.comma = !!r.comma),
        (this.precision = void 0 === r.precision ? void 0 : +r.precision),
        (this.trim = !!r.trim),
        (this.type = void 0 === r.type ? "" : r.type + "");
    }
    function Fr(r, n) {
      if (
        (t = (r = n ? r.toExponential(n - 1) : r.toExponential()).indexOf(
          "e",
        )) < 0
      )
        return null;
      var t,
        e = r.slice(0, t);
      return [e.length > 1 ? e[0] + e.slice(2) : e, +r.slice(t + 1)];
    }
    function Sr(r) {
      return (r = Fr(Math.abs(r))) ? r[1] : NaN;
    }
    function qr(r, n) {
      var t = Fr(r, n);
      if (!t) return r + "";
      var e = t[0],
        a = t[1];
      return a < 0
        ? "0." + new Array(-a).join("0") + e
        : e.length > a + 1
        ? e.slice(0, a + 1) + "." + e.slice(a + 1)
        : e + new Array(a - e.length + 2).join("0");
    }
    (Or.prototype = jr.prototype),
      (jr.prototype.toString = function () {
        return (
          this.fill +
          this.align +
          this.sign +
          this.symbol +
          (this.zero ? "0" : "") +
          (void 0 === this.width ? "" : Math.max(1, 0 | this.width)) +
          (this.comma ? "," : "") +
          (void 0 === this.precision
            ? ""
            : "." + Math.max(0, 0 | this.precision)) +
          (this.trim ? "~" : "") +
          this.type
        );
      });
    var Pr = {
      "%": (r, n) => (100 * r).toFixed(n),
      b: r => Math.round(r).toString(2),
      c: r => r + "",
      d: function (r) {
        return Math.abs((r = Math.round(r))) >= 1e21
          ? r.toLocaleString("en").replace(/,/g, "")
          : r.toString(10);
      },
      e: (r, n) => r.toExponential(n),
      f: (r, n) => r.toFixed(n),
      g: (r, n) => r.toPrecision(n),
      o: r => Math.round(r).toString(8),
      p: (r, n) => qr(100 * r, n),
      r: qr,
      s: function (r, n) {
        var t = Fr(r, n);
        if (!t) return r + "";
        var e = t[0],
          a = t[1],
          o = a - (Ar = 3 * Math.max(-8, Math.min(8, Math.floor(a / 3)))) + 1,
          i = e.length;
        return o === i
          ? e
          : o > i
          ? e + new Array(o - i + 1).join("0")
          : o > 0
          ? e.slice(0, o) + "." + e.slice(o)
          : "0." +
            new Array(1 - o).join("0") +
            Fr(r, Math.max(0, n + o - 1))[0];
      },
      X: r => Math.round(r).toString(16).toUpperCase(),
      x: r => Math.round(r).toString(16),
    };
    function Dr(r) {
      return r;
    }
    var zr,
      Cr,
      $r,
      Ir = Array.prototype.map,
      Rr = [
        "y",
        "z",
        "a",
        "f",
        "p",
        "n",
        "µ",
        "m",
        "",
        "k",
        "M",
        "G",
        "T",
        "P",
        "E",
        "Z",
        "Y",
      ];
    function Br(r) {
      var n = r.domain;
      return (
        (r.ticks = function (r) {
          var t = n();
          return (function (r, n, t) {
            var e,
              a,
              o,
              i,
              u = -1;
            if (((t = +t), (r = +r) == (n = +n) && t > 0)) return [r];
            if (
              ((e = n < r) && ((a = r), (r = n), (n = a)),
              0 === (i = v(r, n, t)) || !isFinite(i))
            )
              return [];
            if (i > 0) {
              let t = Math.round(r / i),
                e = Math.round(n / i);
              for (
                t * i < r && ++t,
                  e * i > n && --e,
                  o = new Array((a = e - t + 1));
                ++u < a;

              )
                o[u] = (t + u) * i;
            } else {
              i = -i;
              let t = Math.round(r * i),
                e = Math.round(n * i);
              for (
                t / i < r && ++t,
                  e / i > n && --e,
                  o = new Array((a = e - t + 1));
                ++u < a;

              )
                o[u] = (t + u) / i;
            }
            return e && o.reverse(), o;
          })(t[0], t[t.length - 1], null == r ? 10 : r);
        }),
        (r.tickFormat = function (r, t) {
          var e = n();
          return (function (r, n, t, e) {
            var a,
              o = (function (r, n, t) {
                var e = Math.abs(n - r) / Math.max(0, t),
                  a = Math.pow(10, Math.floor(Math.log(e) / Math.LN10)),
                  o = e / a;
                return (
                  o >= p ? (a *= 10) : o >= b ? (a *= 5) : o >= m && (a *= 2),
                  n < r ? -a : a
                );
              })(r, n, t);
            switch ((e = Or(null == e ? ",f" : e)).type) {
              case "s":
                var i = Math.max(Math.abs(r), Math.abs(n));
                return (
                  null != e.precision ||
                    isNaN(
                      (a = (function (r, n) {
                        return Math.max(
                          0,
                          3 * Math.max(-8, Math.min(8, Math.floor(Sr(n) / 3))) -
                            Sr(Math.abs(r)),
                        );
                      })(o, i)),
                    ) ||
                    (e.precision = a),
                  $r(e, i)
                );
              case "":
              case "e":
              case "g":
              case "p":
              case "r":
                null != e.precision ||
                  isNaN(
                    (a = (function (r, n) {
                      return (
                        (r = Math.abs(r)),
                        (n = Math.abs(n) - r),
                        Math.max(0, Sr(n) - Sr(r)) + 1
                      );
                    })(o, Math.max(Math.abs(r), Math.abs(n)))),
                  ) ||
                  (e.precision = a - ("e" === e.type));
                break;
              case "f":
              case "%":
                null != e.precision ||
                  isNaN(
                    (a = (function (r) {
                      return Math.max(0, -Sr(Math.abs(r)));
                    })(o)),
                  ) ||
                  (e.precision = a - 2 * ("%" === e.type));
            }
            return Cr(e);
          })(e[0], e[e.length - 1], null == r ? 10 : r, t);
        }),
        (r.nice = function (t) {
          null == t && (t = 10);
          var e,
            a,
            o = n(),
            i = 0,
            u = o.length - 1,
            l = o[i],
            c = o[u],
            s = 10;
          for (
            c < l && ((a = l), (l = c), (c = a), (a = i), (i = u), (u = a));
            s-- > 0;

          ) {
            if ((a = v(l, c, t)) === e) return (o[i] = l), (o[u] = c), n(o);
            if (a > 0) (l = Math.floor(l / a) * a), (c = Math.ceil(c / a) * a);
            else {
              if (!(a < 0)) break;
              (l = Math.ceil(l * a) / a), (c = Math.floor(c * a) / a);
            }
            e = a;
          }
          return r;
        }),
        r
      );
    }
    (zr = (function (r) {
      var n,
        t,
        e =
          void 0 === r.grouping || void 0 === r.thousands
            ? Dr
            : ((n = Ir.call(r.grouping, Number)),
              (t = r.thousands + ""),
              function (r, e) {
                for (
                  var a = r.length, o = [], i = 0, u = n[0], l = 0;
                  a > 0 &&
                  u > 0 &&
                  (l + u + 1 > e && (u = Math.max(1, e - l)),
                  o.push(r.substring((a -= u), a + u)),
                  !((l += u + 1) > e));

                )
                  u = n[(i = (i + 1) % n.length)];
                return o.reverse().join(t);
              }),
        a = void 0 === r.currency ? "" : r.currency[0] + "",
        o = void 0 === r.currency ? "" : r.currency[1] + "",
        i = void 0 === r.decimal ? "." : r.decimal + "",
        u =
          void 0 === r.numerals
            ? Dr
            : (function (r) {
                return function (n) {
                  return n.replace(/[0-9]/g, function (n) {
                    return r[+n];
                  });
                };
              })(Ir.call(r.numerals, String)),
        l = void 0 === r.percent ? "%" : r.percent + "",
        c = void 0 === r.minus ? "−" : r.minus + "",
        s = void 0 === r.nan ? "NaN" : r.nan + "";
      function h(r) {
        var n = (r = Or(r)).fill,
          t = r.align,
          h = r.sign,
          f = r.symbol,
          g = r.zero,
          d = r.width,
          p = r.comma,
          b = r.precision,
          m = r.trim,
          v = r.type;
        "n" === v
          ? ((p = !0), (v = "g"))
          : Pr[v] || (void 0 === b && (b = 12), (m = !0), (v = "g")),
          (g || ("0" === n && "=" === t)) && ((g = !0), (n = "0"), (t = "="));
        var y =
            "$" === f
              ? a
              : "#" === f && /[boxX]/.test(v)
              ? "0" + v.toLowerCase()
              : "",
          w = "$" === f ? o : /[%p]/.test(v) ? l : "",
          M = Pr[v],
          k = /[defgprs%]/.test(v);
        function x(r) {
          var a,
            o,
            l,
            f = y,
            x = w;
          if ("c" === v) (x = M(r) + x), (r = "");
          else {
            var N = (r = +r) < 0 || 1 / r < 0;
            if (
              ((r = isNaN(r) ? s : M(Math.abs(r), b)),
              m &&
                (r = (function (r) {
                  r: for (var n, t = r.length, e = 1, a = -1; e < t; ++e)
                    switch (r[e]) {
                      case ".":
                        a = n = e;
                        break;
                      case "0":
                        0 === a && (a = e), (n = e);
                        break;
                      default:
                        if (!+r[e]) break r;
                        a > 0 && (a = 0);
                    }
                  return a > 0 ? r.slice(0, a) + r.slice(n + 1) : r;
                })(r)),
              N && 0 == +r && "+" !== h && (N = !1),
              (f =
                (N ? ("(" === h ? h : c) : "-" === h || "(" === h ? "" : h) +
                f),
              (x =
                ("s" === v ? Rr[8 + Ar / 3] : "") +
                x +
                (N && "(" === h ? ")" : "")),
              k)
            )
              for (a = -1, o = r.length; ++a < o; )
                if (48 > (l = r.charCodeAt(a)) || l > 57) {
                  (x = (46 === l ? i + r.slice(a + 1) : r.slice(a)) + x),
                    (r = r.slice(0, a));
                  break;
                }
          }
          p && !g && (r = e(r, 1 / 0));
          var A = f.length + r.length + x.length,
            E = A < d ? new Array(d - A + 1).join(n) : "";
          switch (
            (p &&
              g &&
              ((r = e(E + r, E.length ? d - x.length : 1 / 0)), (E = "")),
            t)
          ) {
            case "<":
              r = f + r + x + E;
              break;
            case "=":
              r = f + E + r + x;
              break;
            case "^":
              r = E.slice(0, (A = E.length >> 1)) + f + r + x + E.slice(A);
              break;
            default:
              r = E + f + r + x;
          }
          return u(r);
        }
        return (
          (b =
            void 0 === b
              ? 6
              : /[gprs]/.test(v)
              ? Math.max(1, Math.min(21, b))
              : Math.max(0, Math.min(20, b))),
          (x.toString = function () {
            return r + "";
          }),
          x
        );
      }
      return {
        format: h,
        formatPrefix: function (r, n) {
          var t = h((((r = Or(r)).type = "f"), r)),
            e = 3 * Math.max(-8, Math.min(8, Math.floor(Sr(n) / 3))),
            a = Math.pow(10, -e),
            o = Rr[8 + e / 3];
          return function (r) {
            return t(a * r) + o;
          };
        },
      };
    })({ thousands: ",", grouping: [3], currency: ["$", ""] })),
      (Cr = zr.format),
      ($r = zr.formatPrefix);
    var Ur = {
      scale: {
        linear: function r() {
          var n = xr();
          return (
            (n.copy = function () {
              return kr(n, r());
            }),
            Nr.apply(n, arguments),
            Br(n)
          );
        },
      },
    };
    function _r(r, n) {
      return (
        (function (r) {
          if (Array.isArray(r)) return r;
        })(r) ||
        (function (r, n) {
          var t =
            null == r
              ? null
              : ("undefined" != typeof Symbol && r[Symbol.iterator]) ||
                r["@@iterator"];
          if (null != t) {
            var e,
              a,
              o = [],
              i = !0,
              u = !1;
            try {
              for (
                t = t.call(r);
                !(i = (e = t.next()).done) &&
                (o.push(e.value), !n || o.length !== n);
                i = !0
              );
            } catch (r) {
              (u = !0), (a = r);
            } finally {
              try {
                i || null == t.return || t.return();
              } finally {
                if (u) throw a;
              }
            }
            return o;
          }
        })(r, n) ||
        (function (r, n) {
          if (r) {
            if ("string" == typeof r) return Tr(r, n);
            var t = Object.prototype.toString.call(r).slice(8, -1);
            return (
              "Object" === t && r.constructor && (t = r.constructor.name),
              "Map" === t || "Set" === t
                ? Array.from(r)
                : "Arguments" === t ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
                ? Tr(r, n)
                : void 0
            );
          }
        })(r, n) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
          );
        })()
      );
    }
    function Tr(r, n) {
      (null == n || n > r.length) && (n = r.length);
      for (var t = 0, e = new Array(n); t < n; t++) e[t] = r[t];
      return e;
    }
    var Lr = function (r, n) {
        var t = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        if (t) return Ur.scale.quantile().domain(r).range(n);
        var e = _r(r, 2),
          a = e[0],
          o = e[1];
        return Ur.scale
          .linear()
          .domain(3 === n.length ? [a, a + (o - a) / 2, o] : [a, o])
          .range(n);
      },
      Hr = /rgba\((\d+\.\d+),\s*(\d+\.\d+),\s*(\d+\.\d+),\s*(\d+\.\d+)\)/,
      Jr = function (r) {
        return r.replace(Hr, function (r, n, t, e, a) {
          return "rgba("
            .concat(Math.round(n), ",")
            .concat(Math.round(t), ",")
            .concat(Math.round(e), ",")
            .concat(a, ")");
        });
      };
    function Gr(r) {
      return (
        (function (r) {
          if (Array.isArray(r)) return Vr(r);
        })(r) ||
        (function (r) {
          if (
            ("undefined" != typeof Symbol && null != r[Symbol.iterator]) ||
            null != r["@@iterator"]
          )
            return Array.from(r);
        })(r) ||
        (function (r, n) {
          if (r) {
            if ("string" == typeof r) return Vr(r, n);
            var t = Object.prototype.toString.call(r).slice(8, -1);
            return (
              "Object" === t && r.constructor && (t = r.constructor.name),
              "Map" === t || "Set" === t
                ? Array.from(r)
                : "Arguments" === t ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
                ? Vr(r, n)
                : void 0
            );
          }
        })(r) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
          );
        })()
      );
    }
    function Vr(r, n) {
      (null == n || n > r.length) && (n = r.length);
      for (var t = 0, e = new Array(n); t < n; t++) e[t] = r[t];
      return e;
    }
    var Wr = function (r, n) {
        return (
          "string" == typeof r &&
          "string" == typeof n &&
          !!r.length &&
          !!n.length
        );
      },
      Xr = {
        "<": function (r, n) {
          return function (t) {
            return "number" == typeof r && t < r ? n : null;
          };
        },
        "<=": function (r, n) {
          return function (t) {
            return "number" == typeof r && t <= r ? n : null;
          };
        },
        ">=": function (r, n) {
          return function (t) {
            return "number" == typeof r && t >= r ? n : null;
          };
        },
        ">": function (r, n) {
          return function (t) {
            return "number" == typeof r && t > r ? n : null;
          };
        },
        "=": function (r, n) {
          return function (t) {
            return t === r ? n : null;
          };
        },
        "!=": function (r, n) {
          return function (t) {
            return ("string" == typeof (e = r) && !e.length) || t === r
              ? null
              : n;
            var e;
          };
        },
        "is-null": function (r, n) {
          return function (r) {
            return null === r ? n : null;
          };
        },
        "not-null": function (r, n) {
          return function (r) {
            return null !== r ? n : null;
          };
        },
        contains: function (r, n) {
          return function (t) {
            return Wr(r, t) && t.indexOf(r) >= 0 ? n : null;
          };
        },
        "does-not-contain": function (r, n) {
          return function (t) {
            return Wr(r, t) && t.indexOf(r) < 0 ? n : null;
          };
        },
        "starts-with": function (r, n) {
          return function (t) {
            return Wr(r, t) && t.startsWith(r) ? n : null;
          };
        },
        "ends-with": function (r, n) {
          return function (t) {
            return Wr(r, t) && t.endsWith(r) ? n : null;
          };
        },
      };
    function Yr(r, n, t) {
      var e = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
      if ("single" === r.type) {
        var a = r.operator,
          o = r.value,
          i = r.color;
        i = s(i, e ? 0.2 : 0.65);
        var u = Xr[a];
        return u
          ? u(o, i)
          : (console.error("Unsupported formatting operator:", a),
            function () {
              return null;
            });
      }
      if ("range" === r.type) {
        var l = function (r) {
            return t && t[r] && t[r][0];
          },
          c = function (r) {
            return t && t[r] && t[r][1];
          },
          h =
            "custom" === r.min_type
              ? parseFloat(r.min_value)
              : "all" === r.min_type
              ? Math.min.apply(Math, Gr(r.columns.map(l)))
              : l(n),
          f =
            "custom" === r.max_type
              ? parseFloat(r.max_value)
              : "all" === r.max_type
              ? Math.max.apply(Math, Gr(r.columns.map(c)))
              : c(n);
        if ("number" != typeof f || "number" != typeof h)
          return (
            console.warn("Invalid range min/max", h, f),
            function () {
              return null;
            }
          );
        var g = Lr(
          [h, f],
          r.colors.map(function (r) {
            return s(r, 0.75);
          }),
        ).clamp(!0);
        return function (r) {
          var n = g(r);
          return n ? Jr(n) : null;
        };
      }
      return (
        console.warn("Unknown format type", r.type),
        function () {
          return null;
        }
      );
    }
    (t.g.console = { log: print, warn: print, error: print }),
      (t.g.makeCellBackgroundGetter = function (r, n, t) {
        var e = r,
          a = JSON.parse(n),
          o = JSON.parse(t);
        try {
          var i;
          return (function (r, n, t, e) {
            var a = {},
              o = [],
              i = (function (r) {
                for (var n = {}, t = 0; t < r.length; t++) n[r[t].name] = t;
                return n;
              })(n);
            try {
              var u = (function (r, n, t) {
                var e = {};
                return (
                  r.forEach(function (r) {
                    r.columns.forEach(function (r) {
                      if (!e[r]) {
                        var a = t[r];
                        e[r] = (function (r, n) {
                          for (
                            var t = 1 / 0, e = -1 / 0, a = r.length, o = 0;
                            o < a;
                            o++
                          ) {
                            var i = r[o][n];
                            i < t && (t = i), i > e && (e = i);
                          }
                          return [t, e];
                        })(n, a);
                      }
                    });
                  }),
                  e
                );
              })(t, r, i);
              (a = (function (r, n) {
                var t = {};
                return (
                  r.forEach(function (r) {
                    r.columns.forEach(function (e) {
                      (t[e] = t[e] || []), t[e].push(Yr(r, e, n, !1));
                    });
                  }),
                  t
                );
              })(t, u)),
                (o = (function (r) {
                  var n = [];
                  return (
                    r
                      .filter(function (r) {
                        return "single" === r.type && r.highlight_row;
                      })
                      .forEach(function (r) {
                        var t = Yr(r, null, null, !0);
                        t &&
                          r.columns.forEach(function (r) {
                            n.push(function (n, e) {
                              return t(n[e[r]]);
                            });
                          });
                      }),
                    n
                  );
                })(t));
            } catch (r) {
              console.error(
                "Unexpected error compiling column formatters: ",
                r,
              );
            }
            return 0 === Object.keys(a).length && 0 === o.length
              ? function () {
                  return null;
                }
              : function (n, t, u) {
                  if (a[u])
                    for (var l = 0; l < a[u].length; l++) {
                      var c = (0, a[u][l])(n);
                      if (null != c) return c;
                    }
                  if (!e)
                    for (var s = 0; s < o.length; s++) {
                      var h = (0, o[s])(r[t], i);
                      if (null != h) return h;
                    }
                  return null;
                };
          })(
            e,
            a,
            null !== (i = o["table.column_formatting"]) && void 0 !== i
              ? i
              : [],
            o["table.pivot"],
          );
        } catch (r) {
          return (
            print("ERROR", r),
            function () {
              return null;
            }
          );
        }
      });
  })(),
    (shared = e);
})();
