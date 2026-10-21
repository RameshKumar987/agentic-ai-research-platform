from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import store

client = TestClient(app)

SAMPLE = {
    "title": "CareFlow Hospital Platform",
    "idea": (
        "An AI-powered hospital management platform that manages appointments, patient "
        "records, diagnostics, and doctor workflows."
    ),
    "domain": "Healthcare",
    "complexity": "Intermediate",
}


@pytest.fixture(autouse=True)
def clean_store():
    store.clear()
    yield
    store.clear()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["projects"] == 0
    assert body["generator"]["active"] == "template"
    assert "in-memory" in body["storage"]


def test_generate_list_and_fetch_project():
    created = client.post("/api/research/generate", json=SAMPLE)
    assert created.status_code == 201
    project = created.json()

    assert project["id"].startswith("prj_")
    assert project["title"] == SAMPLE["title"]
    assert len(project["sections"]) == 11
    assert project["meta"]["generator"] == "template"
    assert project["meta"]["simulatedAgents"] is True
    assert "flowchart" in project["architecture"]["mermaid"]
    assert len(project["techStack"]) > 5
    assert project["apiEndpoints"]

    listing = client.get("/api/projects")
    assert listing.status_code == 200
    assert listing.json()["count"] == 1
    assert listing.json()["items"][0]["sectionCount"] == 11

    fetched = client.get(f"/api/projects/{project['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["summary"] == project["summary"]


def test_validation_errors_are_structured():
    response = client.post(
        "/api/research/generate",
        json={**SAMPLE, "title": "x", "idea": " " * 40},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    fields = {item["field"] for item in body["error"]["fields"]}
    assert "title" in fields
    assert "idea" in fields
    assert store.count() == 0


def test_missing_project_returns_structured_404():
    response = client.get("/api/projects/prj_does_not_exist")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "PROJECT_NOT_FOUND"
