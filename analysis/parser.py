import ast
import collections
import glob
import json
import os


import matplotlib.pyplot as plt
import networkx as nx


Level = collections.namedtuple("Level", "id actions")


def read_events(directory):
    """
    Read all events from all log files in a given directory.

    Assumes that the lexicographic ordering of the log file names
    corresponds with the temporal ordering of the events in the log
    files.
    """
    log_files = glob.glob(os.path.join(directory, "*.json"))
    log_files.sort()

    events = []
    level_sequence = []

    for log_file in log_files:
        with open(log_file) as f:
            for line in f:
                events.append(json.loads(line))


    current_level = None
    actions = []
    for event in events:
        if event["0"] == "action":
            level_id = event["1"]["quest_id"]
            if level_id != current_level:
                if current_level is not None:
                    level_sequence.append(Level(current_level, actions))
                actions = []
                current_level = level_id
            actions.append(event)

    return events, level_sequence

# TODO: account for prev/next

def get_state_graphs(level):
    """
    Get all the state graphs for a given playthough of a given level.
    """
    graphs = []
    condition = None
    for action in level.actions:
        if action["1"]["action_id"] == "condition":
            condition = action["1"]["action_detail"]
        elif action["1"]["action_id"] == "victory":
            graphs[-1].graph["victory"] = True
        elif action["1"]["action_id"] == "dead-end":
            # TODO: synthesize a reset event?
            graphs[-1].graph["reset"] = True

        if action["1"]["action_id"] != "state-path-save":
            continue

        graph_detail = json.loads(action["1"]["action_detail"])
        graph = nx.DiGraph(victory=False, reset=False)
        nodes = []
        for idx, node in enumerate(graph_detail["nodes"]):
            if node["data"] == "reset":
                nodes.append("reset")
                graph.graph["reset"] = True
                graph.add_node("reset")
            else:
                # Nodes are labeled with the sorted string representation
                # of the board state
                nodes.append(repr(list(sorted(node["data"]["board"]))))
                graph.add_node(nodes[-1], node_data=node["data"])

        for edge in graph_detail["edges"]:
            graph.add_edge(nodes[edge["from"]], nodes[edge["to"]])

        graph.graph["dynamic_quest_id"] = action["1"]["dynamic_quest_id"]
        graph.graph["quest_seq_id"] = action["1"]["quest_seq_id"]
        graphs.append(graph)

    for graph in graphs:
        graph.graph["condition"] = condition

    return graphs


def get_complete_state_graphs(level_sequence, level_id):
    """Get all state graphs for all playthroughs of a given level."""
    graphs = []
    for level in level_sequence:
        if level.id == level_id:
            graphs.extend(get_state_graphs(level))
    return graphs


def only_complete_graphs(graphs):
    """
    Filter out graphs not caused by victory or reset.
    """
    finished_quests = set()
    max_quest_seq_id = {}
    result = []
    for graph in graphs:
        dynamic_quest_id = graph.graph["dynamic_quest_id"]
        quest_seq_id = graph.graph["quest_seq_id"]
        if graph.graph["reset"] or graph.graph["victory"]:
            result.append(graph)
            finished_quests.add(dynamic_quest_id)
        else:
            if dynamic_quest_id not in max_quest_seq_id:
                max_quest_seq_id[dynamic_quest_id] = (graph, quest_seq_id)
            elif quest_seq_id > max_quest_seq_id[dynamic_quest_id][1]:
                max_quest_seq_id[dynamic_quest_id] = (graph, quest_seq_id)

    for dynamic_quest_id, (graph, _) in max_quest_seq_id.items():
        if dynamic_quest_id not in finished_quests:
            result.append(graph)

    return result


def draw_graph(graph, size=(20, 20)):
    """
    Draw a graph via Matplotlib.
    """
    # Make the plot bigger
    plt.figure(3,figsize=size)
    if graph.graph.get("weighted"):
        high = [(u,v) for (u, v, d) in graph.edges(data=True) if d["weight"] > 0.5]
        med = [(u,v) for (u, v, d) in graph.edges(data=True) if 0.25 < d['weight'] <= 0.5]
        low = [(u,v) for (u, v, d) in graph.edges(data=True) if d['weight'] <= 0.25]
        pos = nx.shell_layout(graph)
        nx.draw_networkx_edges(graph, pos, edgelist=high, width=5)
        nx.draw_networkx_edges(graph, pos, edgelist=med, width=3,
                               alpha=0.8, style="dashed")
        nx.draw_networkx_edges(graph, pos, edgelist=low,
                               width=1, alpha=0.5, style="dashed")

        terminal = [node for (node, d) in graph.nodes(data=True) if d["terminal"]]
        initial = [node for (node, d) in graph.nodes(data=True) if d["initial"]]
        high = [node for (node, d) in graph.nodes(data=True) if d["weight"] > 0.5]
        low = [node for (node, d) in graph.nodes(data=True) if d["weight"] <= 0.5]
        nx.draw_networkx_nodes(graph, pos, high, node_size=300)
        nx.draw_networkx_nodes(graph, pos, low, node_size=150)
        nx.draw_networkx_nodes(graph, pos, terminal, node_color="blue")
        nx.draw_networkx_nodes(graph, pos, initial, node_color="green")

        nx.draw_networkx_labels(graph, pos, font_size=16, font_family='sans-serif')
    else:
        nx.draw_networkx(
            graph,
            with_labels=True,
        )
    plt.axis('off')
    plt.tight_layout()


def merge_graphs(graphs):
    """
    Given a list of graphs, make a single merged weighted graph.

    Also marks nodes as terminal or initial (based on outputs/inputs).
    """
    nodes = []
    node_mapping = {} # board_label -> node_idx
    edge_weights = collections.Counter()
    node_weights = collections.Counter()

    for (graph_idx, graph) in enumerate(graphs):
        for idx, node in enumerate(graph):
            node_weights[node] += 1
            if node not in node_mapping:
                nodes.append(node)
                node_mapping[node] = len(nodes) - 1

        for edge in graph.edges():
            edge_weights[edge] += 1

    graph = nx.DiGraph()
    max_node_count = max(node_weights.values()) if node_weights else 0
    for node, count in node_weights.items():
        graph.add_node(node, weight=count/max_node_count, count=count,
                       terminal=True, initial=True)
    max_count = max(edge_weights.values()) if edge_weights else 0
    for edge, count in edge_weights.items():
        graph.node[edge[0]]["terminal"] = False
        graph.node[edge[1]]["initial"] = False
        graph.add_edge(*edge, weight=count/max_count, count=count)

    graph.graph["weighted"] = True
    graph.graph["condition"] = graphs[0].graph["condition"]

    return graph


def mark_liveness(graph):
    """
    Mark nodes in a graph as 'live' if they lead to a non-RESET
    terminal state, and 'dead' otherwise.
    """
    terminal = []
    for node, data in graph.nodes(data=True):
        data["live"] = False
        if data["terminal"]:
            terminal.append(node)

    while terminal:
        node = terminal.pop()
        if node == "reset" or graph.node[node]["live"]:
            continue

        graph.node[node]["live"] = True
        for pred in graph.predecessors(node):
            terminal.append(pred)

    for start, end, data in graph.edges(data=True):
        data["live"] = graph.node[end]["live"]

    return graph


def get_complete_merged_graph(level_sequence, level_id):
    """
    Merge all complete graphs (completed level or reset) for all
    playthoughs of a given level.
    """
    return merge_graphs(only_complete_graphs(
        get_complete_state_graphs(level_sequence, level_id)))


def get_all_complete_merged_graphs(level_sequence):
    seen = set()
    result = []
    for level in level_sequence:
        if level.id in seen:
            continue
        seen.add(level.id)
        result.append(get_complete_merged_graph(level_sequence, level.id))
    return result
