import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { createDB } from './db'
import history from '../history'
import { Wrapper, Input, Results, Result } from './styles'

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const ENTER = 'Enter'
const ESCAPE = 'Escape'

class Search extends Component {
  constructor (props) {
    super(props)

    // Basic state for querying and loading
    this.state = {
      query: '',
      loading: false,
      selectedIndex: 0,
      results: [],
    }

    // Initialize search instance and set indices
    this.db = createDB({
      ref: 'url',
      indices: ['title'],
      items: props.manifest.files,
    })
  }

  handleChange = e => {
    const { value } = e.target
    this.setState({
      query: value,
      loading: value.length !== 0
    }, async () => {
      const results = await this.fetchResults(value)
      this.setState({ results, loading: false })
    })
  }

  handleKeyUp = e => {
    const { key } = e

    if (e.key === ESCAPE) {
      return this.clearSearch()
    }

    // Only listen for key up, down, and enter
    if (
      !key === UP &&
      !key === DOWN &&
      !key === ENTER
    ) return false

    // Get the selected index if it exists
    const { selectedIndex = 0, results } = this.state

    if (key === ENTER) {
      const selected = results[selectedIndex]
      if (selected) history.push(selected.url)
      this.clearSearch()
    }

    // Next selected index
    let nextIndex = selectedIndex

    if (key === UP) {
      if (selectedIndex === 0) {
        nextIndex = results.length - 1
      } else if (selectedIndex < 0) {
        nextIndex = results.length - 1
      } else {
        nextIndex = selectedIndex - 1
      }
    }

    if (key === DOWN) {
      if (selectedIndex === results.length - 1) {
        nextIndex = 0
      } else {
        nextIndex = selectedIndex + 1
      }
    }

    this.setState({ selectedIndex: nextIndex })
  }

  fetchResults (query) {
    return new Promise((resolve, reject) => {
      const results = this.db.search(query)
      resolve(results)
    })
  }

  clearSearch = () => {
    this.setState({ loading: false, query: '', results: [] })
  }

  renderResults () {
    const { query, loading, selectedIndex, results } = this.state
    if (!query.length) return null

    // Map over search results and create links
    const items = results.map((r, i) =>
      <Result
        key={r.file}
        selected={i === selectedIndex}
        onClick={this.clearSearch}
      >
        <Link to={r.url}>
          <h4>{r.title}</h4>
          <p>{r.url}</p>
        </Link>
      </Result>
    )

    return (
      <Results>
        {items.length !== 0 && !loading && items}
        {items.length === 0 && !loading && <span>No Results...</span>}
        {loading && <span>Loading...</span>}
      </Results>
    )
  }

  render () {
    return (
      <Wrapper>
        <Input
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          value={this.state.query}
          placeholder="Search documentation..."
        />
        {this.renderResults()}
      </Wrapper>
    )
  }
}

export default Search
