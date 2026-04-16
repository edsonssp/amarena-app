Crie um arquivo chamado Dockerfile (sem extensão) na raiz do repositório com este conteúdo:

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
