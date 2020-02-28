
function Automixer(auto_data, img) {
  const cvs = document.createElement('canvas');
  cvs.width = img.width;
  cvs.height = img.height;
  const buf = cvs.getContext('2d');

  auto_data.col = img.height;
  auto_data.row = img.width;
  const auto = Automata(auto_data);

  function proc() {
    buf.drawImage(img, 0, 0);
    const img_data = buf.getImageData(0, 0, img.width, img.height);

    let i = 0;
    for (let y = 0; y < auto_data.col; ++y) for (let x = 0; x < auto_data.row; ++x) {
      if (auto.proc(x, y)) img_data.data[i + 3] = 0;
      i += 4;
    }

    auto.swap();

    buf.clearRect(0, 0, img.width, img.height);
    buf.putImageData(img_data, 0, 0);
    return buf.canvas;
  }

  return {
    proc
  }
}

Automixer.test = (wrapper = document.body) => {
  const img1 = document.createElement('img');
  wrapper.appendChild(img1);
  img1.src = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQ\
ABAAD/4AAcT2NhZCRSZXY6IDIwMTkzICQAAAAAAAAAAAj/2wCEAAYEBAYIB\
ggICAgJCAgICQsKCgoKCwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMc\
GxsbHB8fHx8fHx8fHx8BBxAQICAgICAgIEBAQEBAgICAgICAgICAgICAgIC\
AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/AABEIAEAAQA\
MBEQACEQEDEQH/xACFAAACAwEBAAAAAAAAAAAAAAAGBwMEBQgCAQADAQEBA\
QAAAAAAAAAAAAADBAUBAgYAEAACAQIEBAMGBQMEAAAAAAABAgMEEQAFEiEG\
EyIxB0FRFCQyYXGRIzNCgcEVsdFSU2KhEQADAQACAwABBQAAAAAAAAAAAQI\
RITEDEkETBCJRYXH/2gAMAwEAAhEDEQA/AFX4j8GS0+e5uza44YpXaNQzDV\
qbSiqT6sdzgGjmaUvCzhz2nN7SlmEIu25IuT2wO6GPFJ1jwrBFCiou1hbCy\
GqCo2+uCsUKVWOk998AYVCo8QeC5s493hNpyfw9yN8DjsLXTFzldFV0EtK0\
jSxT0zFT1EgEGx0sb2PqMOK2mIVKaHFw5xR7VPBIo9oVI2L8x2N5EIBPz28\
sX4pNdkO5aYv/AB/SWo4jgo49Q6FHTuXlP8It/wB8RH2Wl0DnhPkFXSVtTJ\
KhUc9our1U2b7YVtlGFwPygzGhhA5lTDG3o0iqfsTjlHRvUucUknTHPHI3/\
Fg39sboH1Kef8RUdDTST1MixxRqWZm7AWxw2dJCgpvGqKvz6njyyBAomUGo\
qn5SkXt0oupsGmOdOHW6XuIHEucyULRJ7zUOdS3YBrajYfMXGOnXYr6hLwP\
w7FTt7TGy8iCMoytsFkJuNv33xZ8c4iZbbYqsxmqqfjrLK2tqOdz6uNJFk8\
xI9rqD+2IqrdL1eNfA6hoXmWuSNSWFbUgqp0N+YexHY74AHwVPFmWzSTyRQ\
ZDGrRMqlmaRpn136l1Nd/nh1Z/Jxf8AQ0ODPDhMqiFdGQsumPWFPS2sAug3\
vde2Fr/06lm/4g5PFV+xxzXalnB5g3te3TexGFd5Ou9BThzwcoqKY2g50Ot\
pFebSZFYrpWzIBsve3me+Gn5APojWzqJMv4roakqxhNBqbz6mJiDAeuMYF/\
TFzLjWLW9DDMSNTFtNr/mENr9LjYY9R4+SVE7RBkfBtLn81dnNTJJFJS1Xu\
1j+TFCWsNBHdmF98eawtTeG/wAFvKKitkFyxneaRSQSBI3xADsDgXqMKkMO\
HL6CqAdo0L2+LscagbIs7hipqS6qNN7BV8ycDs2eShWotRlSO0kcfL6gWI6\
T6HC7CfSSirA1EreekD5HyuMbpuA54pxRLPBOXH4VHFCgBt17yEn7qBi0o1\
kS77ErnE7pOZ2Qq0kgUm1h31Dt9cXZfAHx/WNfJ8rjg/qHsySaZQ01VThyF\
mVS3MkA/T6WHxY8lS7wqyz14e5bU0NXUTzESx1yhmubtGltMaj5aRgyOQvo\
Krk1DIDdSbr6WOAMo9o1quvpOU3tJQR2udZsPXvtgegPUX+YcUcMxhxSwvW\
vY6REGKM1/Xz+uAtFCfHTL3C2Y1WYJHzYDSq7hVjZgXtfzt2tjFPIvfGgf4\
nZ3K+dz0yaiqPqiKsFsFQIL6rg3x6b8b7TPLu0KzPJ6lq7ktdRrQquyoSFF\
22sL98OLDpN4OOmzyoy+srTsVI0szXGzHUoB8wxvsMRafA0lyb3Bsplo6pp\
ATJpPxbaNCg32/T6YG+UEXZain5qcxDq0EgMu/7MP8YnuyskXKWeOqUxzRp\
J5WYBh9cD07LUfCn+2yU8diLIqht/nbBOTPymDxNUJlWV1TU7I9U0Zip0Y6\
d2/Mf5aVP3x9H0WrkWcMdXX0yZg2kmR2gl1krvEAwA9NtsXv03k+EXzwAHE\
a+/8wR8tNaiw/1X72BPfFahKGObPMuCzw0xBJhLBiQXc8xxYm1t7W2xF9R/\
20LIFlpKA05ISeovzLCxRCelPrbvibf0pQiXK6FIFIj8/LyOJuFPTOzuglj\
vUU8jRt36f5GMNKeW8RZ3V3h5g27kLY7Y70G8FpxBn881Q0bgmrhnI1MdRV\
VeymxtYfIYOkDDbOcypMr4djWYmRmUw81U6BPOl2YkDuAukE4p+GdZH8wk6\
qoi5caKTIzyarsbG97dRP8A1i8SDq/hLIpZZpM3rACzdNPGV76duZb5W6fv\
hG2OQjLzmZvbnazHfyBxAsvQRQ5jpkuQbfQ4TGD1mVak0ZVUdrj9Kk/xjGY\
ivwens1U4njdFkFkdlIF/S+NRlADxnlL11b/UIohFU0U60zII5PeVAdlmLW\
0fh3Ve+Ht/aBXZPkOUVuv2PNaeSpFRqErDeIwsDpJI/UrevnuMF8dc8A6nd\
AvjTw9q8qq4pF1T0cxtHPYnsQRG4Hwuo+/fHoyBcYf/2Q==`;
  const img2 = document.createElement('img');
  wrapper.appendChild(img2);
  img2.src = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQA\
BAAD/4AAcT2NhZCRSZXY6IDIwMTkzICQAAAAAAAAAAAj/2wCEAAYEBAYIBgg\
ICAgJCAgICQsKCgoKCwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxs\
bHB8fHx8fHx8fHx8BBxAQICAgICAgIEBAQEBAgICAgICAgICAgICAgICAgIC\
AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/AABEIAEAAQAMBEQA\
CEQEDEQH/xACDAAEBAQEAAgAAAAAAAAAAAAAGBwUEAAMBAQEBAQEBAQAAAAA\
AAAAAAAQDAgUBBgAQAAIBAgQDBQYEBgIAAAAAAAECAwQRAAUSIQYTMQciQWF\
xFDJCUYGRI4KhsSRSU2JyssHSEQEBAQABAwUBAAAAAAAAAAAAAQIRAyExEhN\
BUWFx/9oADAMBAAIRAxEAPwCRZbUNJLPZm1SNpG5vYt3j9emIaXjfyISz1sj\
MzcsMI1uTuWYFj9Iwfvg+qXmd1ep6iye93SPn02wc/hxZvmlFHbm1SKxI7mr\
VIfSNbsftj17yEcYaUi9tUGaNTpljbUmqN9j1swIxXI+525d/BeZUzArBO8s\
MqqJYpD+JH/K/mQfHGqGQ8RcW5XSBYqqQ7p8r+l/XHe6e/wBfO9Tp8phV8fZ\
ZJWlY9fK1Cz7jxx0Z1o5t6F+w7L/afa5eWCWJfp8K7339MfL19hI3oZ8wndI\
YIJQqlfxFkMJGrcsLX2+d8T4/Vu59wnVVBeejnkMhjjJjdjdjY7aj54Po7Nc\
dRwVK1askE7wR3YymNbO5Nvj94EHzIxuaTuL9trNMmCZJNBLK9QzRMrSPbUb\
jbYbdcYIs7VO8gkngzWlYPvcRtYaTY7EEfS+L1y+Hq7Tqic1QkK3jK6Rc2BW\
52/LhOKJqJ3Gy6xbbvDzB3+eLpGnD1YkM1QxtblTEk9d0Nv8AjHP06GTfgxk\
qII+nujewviOnXzxY68oAhzmQyF4wwIXSjMTfw2GM1ieaaRsQmsxllv0YASa\
fn3SftiSrJ4vziKPLJZogCscbOA17MVFwD47nbGsp7vapRkdXPJWyVLW1M8j\
qovYFVLWGE1zp3K+MYKSvyWMlRzuWGVgbBiB/tc749xUNxE1S0q9PfHQgjr5\
Y6AZJm6ciOTSd5NX0Umw/TfA4ZSPs8zmNf4eSQo62UEHe3wnE9wvpbL3mr1q\
rxPGdJurlCzfVdW+ITg2f0lyukqpu9UzSyD+mByo7+Fwu5HqcY1YpQztTzpY\
0WhjN2nbvafhijsSD5s1sU6cB6uu3A1lv4XIJ/nJ9dQH/AFxuoxpmRvY6ikZ\
tkZGjJ6aQwYfpjzPljaVyAe0d0gqZLi3QjVtjpucUZlVxzTnppf3d730izg+\
fjgRzmoYtOYU/96KrW+dyuPb4az5VTJ56umIaaN5Iz7sqrqb8yjf7DA3ShRJ\
xI4pzyIGvY96QFVHmFPeP2xNtKeMGRs2SMm7R0xZiepeRtRJ+2F48AdTyzaq\
oZYh4aQbH/Frj/bHrDyqz8DLtb35jARrptcqQdyfAgHrjWc90t0Np7tMNzuw\
/fDwK7ZaWpFT3+pmDdf7t/Lpg5JBkVJz5pN+9HFzIz1s6EkH0vsfXBqVFjyW\
SKSkiY+7Iit6EjHPrrOiSJCCP1v4Y/PyQZsBJnfMe5jkWQN4bC5H7Yfnw5u/\
Lol4fNW5HM0xlTKdPyPdUfXGfUzwNcS1rrekjb8AG2lbb6SbXNrnDcQLdYMB\
IlT/IfviyDTq55+edTs6hiNxv1PXxuOmIEcmfBGQ1E8pWmIaU00skhZhoVBG\
zA7en3wekxXeyThM5rw9HJHUqk8DtDJHINQBUAr3l7w1Kb7jGPa5+Vve4LJO\
zDNSki3p7srKGMu1yLA7KW/TE/Z0p7+Uf7UOAYsniS8/Pq5pVTuqVjjj03e1\
9yfM/bCvTx8i+vljZO4aBJt+XdQ5XchFO1x5Gx+uDKFlHwLwxxFammQ5dmBX\
VFXUiXWXV/WgPckHmulh44bjXwHvKadofZHnnDNTCawJPRzyBYKyC5hdhvoc\
HvRvb4W+hOFcDObtCpDQ8Z53Dy2MCZpU3jFwCjyFxpt02bbGLGpVD7LaWaso\
q2ny2jmNTOYkeouRDEhB1nT0VntcDB+Cef1euCuBVyimphGSJgmmcr0e5LAH\
bfRewPr88XzlHWuS55Xt1OLpA3HHA0WbUk6sP4mxanZidI6XX82nScQ1lXNQ\
um4erMqlkp5kYwyXWxFtam906WWRR4fa+OdqHynPYnkqT1VbDIGIpZI5IZLF\
TZyQRbz07j54Z05yLuqj2h8OJmvDmYZe0fMaWnZovEioi78LLfx1qMPCf/9k=`;
  const cvs = document.createElement('canvas');
  cvs.width = 64;
  cvs.height = 64;
  wrapper.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  const mix = Automixer({
    min: 2,
    max: 4,
    init: [[1,1],[1,1]]
  }, img2);
  return setInterval(() => {
    ctx.drawImage(img1, 0, 0);
    ctx.drawImage(mix.proc(), 0, 0);
  }, 100);
}
