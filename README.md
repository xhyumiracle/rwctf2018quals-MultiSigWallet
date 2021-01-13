https://ctftime.org/task/6366

docker build -t msw .
docker run -d --rm -p 8545:8545 -p 30303:30303 --name chal1 msw
